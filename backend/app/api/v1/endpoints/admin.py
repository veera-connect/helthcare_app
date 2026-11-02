from uuid import UUID, uuid4
from typing import Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.core.security import hash_password
from app.models.user import User, Role
from app.models.patient import Patient
from app.models.doctor import Doctor, Specialization, DoctorAvailability
from app.models.appointment import Appointment, AppointmentStatus
from app.models.audit import AuditLog
from app.models.admin import HospitalService, SystemSetting

router = APIRouter(prefix="/admin", tags=["Admin"])


# ── Pydantic schemas (inline for simplicity) ──────────────────────────────────

class ServiceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon_name: str = "Heart"
    color_gradient: str = "from-primary-400 to-primary-600"
    bg_class: str = "bg-primary-50 dark:bg-primary-950/30"
    availability: str = "Mon–Fri"
    patient_count: int = 0
    doctor_count: int = 0
    sort_order: int = 0


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon_name: Optional[str] = None
    color_gradient: Optional[str] = None
    bg_class: Optional[str] = None
    availability: Optional[str] = None
    is_active: Optional[bool] = None
    patient_count: Optional[int] = None
    doctor_count: Optional[int] = None
    sort_order: Optional[int] = None


class SettingUpdate(BaseModel):
    value: str


class DoctorCreate(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    license_number: str
    phone: Optional[str] = None
    bio: Optional[str] = None
    years_of_experience: Optional[int] = None
    consultation_fee: Optional[float] = None
    specialization_ids: list[str] = []


class DoctorUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    years_of_experience: Optional[int] = None
    consultation_fee: Optional[float] = None
    is_available: Optional[bool] = None
    specialization_ids: Optional[list[str]] = None


def _require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/stats")
async def get_admin_stats(
    current_user: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)

    patient_count = (await db.execute(select(func.count()).select_from(Patient).where(Patient.deleted_at.is_(None)))).scalar()
    doctor_count = (await db.execute(select(func.count()).select_from(Doctor).where(Doctor.deleted_at.is_(None)))).scalar()
    total_appt = (await db.execute(select(func.count()).select_from(Appointment))).scalar()
    user_count = (await db.execute(select(func.count()).select_from(User).where(User.deleted_at.is_(None)))).scalar()

    appointments_today = (await db.execute(
        select(func.count()).select_from(Appointment).where(
            and_(Appointment.scheduled_at >= today_start, Appointment.scheduled_at < today_end)
        )
    )).scalar()

    completed = (await db.execute(
        select(func.count()).select_from(Appointment).where(
            Appointment.status == "completed"
        )
    )).scalar()
    completion_rate = round((completed / total_appt * 100) if total_appt else 0, 1)

    return {
        "total_patients": patient_count,
        "total_doctors": doctor_count,
        "total_appointments": total_appt,
        "total_users": user_count,
        "appointments_today": appointments_today,
        "completion_rate": completion_rate,
    }


@router.get("/patients")
async def list_patients(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    current_user: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db),
):
    q = select(Patient).options(selectinload(Patient.user)).where(Patient.deleted_at.is_(None))
    if search:
        q = q.where(
            (Patient.first_name.ilike(f"%{search}%")) |
            (Patient.last_name.ilike(f"%{search}%"))
        )
    total_q = select(func.count()).select_from(q.subquery())
    total = (await db.execute(total_q)).scalar()
    result = await db.execute(q.order_by(Patient.created_at.desc()).offset((page - 1) * page_size).limit(page_size))
    patients = result.scalars().all()
    return {
        "items": [
            {
                "id": str(p.id),
                "first_name": p.first_name,
                "last_name": p.last_name,
                "blood_group": p.blood_group.value if p.blood_group else None,
                "date_of_birth": p.date_of_birth.isoformat() if p.date_of_birth else None,
                "phone": p.phone,
                "created_at": p.created_at.isoformat() if p.created_at else None,
                "email": p.user.email if p.user else None,
                "is_active": p.user.is_active if p.user else False,
            }
            for p in patients
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/doctors")
async def list_doctors_admin(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    current_user: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db),
):
    q = select(Doctor).options(selectinload(Doctor.specializations)).where(Doctor.deleted_at.is_(None))
    if search:
        q = q.where(
            (Doctor.first_name.ilike(f"%{search}%")) |
            (Doctor.last_name.ilike(f"%{search}%"))
        )
    total_q = select(func.count()).select_from(
        select(Doctor).where(Doctor.deleted_at.is_(None)).subquery()
    )
    total = (await db.execute(total_q)).scalar()
    result = await db.execute(q.order_by(Doctor.created_at.desc()).offset((page - 1) * page_size).limit(page_size))
    doctors = result.scalars().all()
    return {
        "items": [
            {
                "id": str(d.id),
                "first_name": d.first_name,
                "last_name": d.last_name,
                "license_number": d.license_number,
                "is_available": d.is_available,
                "specializations": [{"id": str(s.id), "name": s.name} for s in d.specializations],
                "created_at": d.created_at.isoformat() if d.created_at else None,
            }
            for d in doctors
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("/doctors/{doctor_id}/approve")
async def approve_doctor(
    doctor_id: UUID,
    current_user: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Doctor).where(Doctor.id == doctor_id))
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    doctor.is_available = True
    await db.commit()
    return {"status": "approved", "doctor_id": str(doctor_id)}


@router.post("/doctors", status_code=201)
async def create_doctor(
    body: DoctorCreate,
    current_user: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db),
):
    existing = (await db.execute(select(User).where(User.email == body.email.lower()))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    new_user = User(
        email=body.email.lower(),
        hashed_password=hash_password(body.password),
        role=Role.DOCTOR,
        is_active=True,
        is_verified=True,
    )
    db.add(new_user)
    await db.flush()

    doctor = Doctor(
        user_id=new_user.id,
        first_name=body.first_name,
        last_name=body.last_name,
        license_number=body.license_number,
        phone=body.phone,
        bio=body.bio,
        years_of_experience=body.years_of_experience,
        consultation_fee=body.consultation_fee,
        is_available=True,
    )

    if body.specialization_ids:
        specs = (await db.execute(
            select(Specialization).where(
                Specialization.id.in_([UUID(s) for s in body.specialization_ids])
            )
        )).scalars().all()
        doctor.specializations = list(specs)

    db.add(doctor)
    await db.flush()

    # Add default Mon–Fri 9am–5pm availability (30-min slots)
    for day in range(5):
        db.add(DoctorAvailability(
            doctor_id=doctor.id,
            day_of_week=day,
            start_time="09:00",
            end_time="17:00",
            slot_duration_minutes=30,
        ))

    await db.commit()
    await db.refresh(doctor)

    return {
        "id": str(doctor.id),
        "user_id": str(new_user.id),
        "email": new_user.email,
        "first_name": doctor.first_name,
        "last_name": doctor.last_name,
        "license_number": doctor.license_number,
        "phone": doctor.phone,
        "years_of_experience": doctor.years_of_experience,
        "consultation_fee": doctor.consultation_fee,
        "is_available": doctor.is_available,
    }


@router.patch("/doctors/{doctor_id}")
async def update_doctor(
    doctor_id: UUID,
    body: DoctorUpdate,
    current_user: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Doctor).options(selectinload(Doctor.specializations)).where(Doctor.id == doctor_id)
    )
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    simple_fields = {"first_name", "last_name", "phone", "bio", "years_of_experience", "consultation_fee", "is_available"}
    for field, val in body.model_dump(exclude_none=True).items():
        if field in simple_fields:
            setattr(doctor, field, val)

    if body.specialization_ids is not None:
        specs = (await db.execute(
            select(Specialization).where(
                Specialization.id.in_([UUID(s) for s in body.specialization_ids])
            )
        )).scalars().all()
        doctor.specializations = list(specs)

    await db.commit()
    await db.refresh(doctor)
    return {
        "id": str(doctor.id),
        "first_name": doctor.first_name,
        "last_name": doctor.last_name,
        "license_number": doctor.license_number,
        "phone": doctor.phone,
        "bio": doctor.bio,
        "years_of_experience": doctor.years_of_experience,
        "consultation_fee": doctor.consultation_fee,
        "is_available": doctor.is_available,
        "specializations": [{"id": str(s.id), "name": s.name} for s in doctor.specializations],
    }


@router.get("/appointments")
async def list_all_appointments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    current_user: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db),
):
    q = select(Appointment).options(
        selectinload(Appointment.patient),
        selectinload(Appointment.doctor),
    )
    if status:
        try:
            q = q.where(Appointment.status == AppointmentStatus(status))
        except ValueError:
            pass
    total_q = select(func.count()).select_from(Appointment)
    if status:
        try:
            total_q = total_q.where(Appointment.status == AppointmentStatus(status))
        except ValueError:
            pass
    total = (await db.execute(total_q)).scalar()
    result = await db.execute(
        q.order_by(Appointment.scheduled_at.desc()).offset((page - 1) * page_size).limit(page_size)
    )
    appts = result.scalars().all()
    return {
        "items": [
            {
                "id": str(a.id),
                "scheduled_at": a.scheduled_at.isoformat(),
                "duration_minutes": a.duration_minutes,
                "status": a.status.value,
                "reason": a.reason,
                "notes": a.notes,
                "patient_id": str(a.patient_id),
                "patient_first_name": a.patient.first_name if a.patient else None,
                "patient_last_name": a.patient.last_name if a.patient else None,
                "doctor_id": str(a.doctor_id),
                "doctor_first_name": a.doctor.first_name if a.doctor else None,
                "doctor_last_name": a.doctor.last_name if a.doctor else None,
            }
            for a in appts
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    search: str = Query(""),
    current_user: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db),
):
    q = select(User).where(User.deleted_at.is_(None))
    if search:
        q = q.where(User.email.ilike(f"%{search}%"))
    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar()
    result = await db.execute(q.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size))
    users = result.scalars().all()
    return {
        "items": [
            {
                "id": str(u.id),
                "email": u.email,
                "role": u.role.value,
                "is_active": u.is_active,
                "is_verified": u.is_verified,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


class SpecializationCreate(BaseModel):
    name: str
    description: Optional[str] = None


@router.get("/specializations")
async def list_specializations(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Specialization).order_by(Specialization.name))
    specs = result.scalars().all()
    return {"items": [{"id": str(s.id), "name": s.name, "description": s.description} for s in specs]}


@router.post("/specializations", status_code=201)
async def create_specialization(
    body: SpecializationCreate,
    current_user: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db),
):
    existing = (await db.execute(select(Specialization).where(Specialization.name == body.name))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Specialization with that name already exists")
    spec = Specialization(name=body.name, description=body.description)
    db.add(spec)
    await db.commit()
    await db.refresh(spec)
    return {"id": str(spec.id), "name": spec.name, "description": spec.description}


@router.delete("/specializations/{spec_id}", status_code=204)
async def delete_specialization(
    spec_id: UUID,
    current_user: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db),
):
    spec = (await db.execute(select(Specialization).where(Specialization.id == spec_id))).scalar_one_or_none()
    if not spec:
        raise HTTPException(status_code=404, detail="Specialization not found")
    await db.delete(spec)
    await db.commit()


@router.get("/audit-logs")
async def get_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    search: str = Query(""),
    current_user: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db),
):
    q = select(AuditLog).options(selectinload(AuditLog.actor))
    if search:
        q = q.where(
            (AuditLog.resource_type.ilike(f"%{search}%")) |
            (AuditLog.action.ilike(f"%{search}%"))
        )
    total_q = select(func.count()).select_from(AuditLog)
    total = (await db.execute(total_q)).scalar()
    result = await db.execute(q.order_by(AuditLog.created_at.desc()).offset((page - 1) * page_size).limit(page_size))
    logs = result.scalars().all()
    return {
        "items": [
            {
                "id": str(lg.id),
                "action": lg.action.value,
                "resource_type": lg.resource_type,
                "resource_id": lg.resource_id,
                "ip_address": lg.ip_address,
                "created_at": lg.created_at.isoformat() if lg.created_at else None,
                "actor_email": lg.actor.email if lg.actor else None,
            }
            for lg in logs
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


# ── Hospital Services CRUD ────────────────────────────────────────────────────

def _service_dict(s: HospitalService) -> dict:
    return {
        "id": str(s.id),
        "name": s.name,
        "description": s.description,
        "icon_name": s.icon_name,
        "color_gradient": s.color_gradient,
        "bg_class": s.bg_class,
        "availability": s.availability,
        "is_active": s.is_active,
        "patient_count": s.patient_count,
        "doctor_count": s.doctor_count,
        "sort_order": s.sort_order,
        "created_at": s.created_at.isoformat() if s.created_at else None,
        "updated_at": s.updated_at.isoformat() if s.updated_at else None,
    }


@router.get("/services")
async def list_services(
    db: AsyncSession = Depends(get_db),
):
    """Public — anyone can see hospital services."""
    result = await db.execute(
        select(HospitalService).order_by(HospitalService.sort_order, HospitalService.name)
    )
    services = result.scalars().all()
    return {"items": [_service_dict(s) for s in services], "total": len(services)}


@router.post("/services", status_code=201)
async def create_service(
    body: ServiceCreate,
    current_user: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db),
):
    existing = (await db.execute(select(HospitalService).where(HospitalService.name == body.name))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="A service with that name already exists")
    svc = HospitalService(id=uuid4(), **body.model_dump())
    db.add(svc)
    await db.commit()
    await db.refresh(svc)
    return _service_dict(svc)


@router.put("/services/{service_id}")
async def update_service(
    service_id: UUID,
    body: ServiceUpdate,
    current_user: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db),
):
    svc = (await db.execute(select(HospitalService).where(HospitalService.id == service_id))).scalar_one_or_none()
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")
    for field, val in body.model_dump(exclude_none=True).items():
        setattr(svc, field, val)
    await db.commit()
    await db.refresh(svc)
    return _service_dict(svc)


@router.patch("/services/{service_id}/toggle")
async def toggle_service(
    service_id: UUID,
    current_user: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db),
):
    svc = (await db.execute(select(HospitalService).where(HospitalService.id == service_id))).scalar_one_or_none()
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")
    svc.is_active = not svc.is_active
    await db.commit()
    return {"id": str(svc.id), "is_active": svc.is_active}


@router.delete("/services/{service_id}", status_code=204)
async def delete_service(
    service_id: UUID,
    current_user: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db),
):
    svc = (await db.execute(select(HospitalService).where(HospitalService.id == service_id))).scalar_one_or_none()
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")
    await db.delete(svc)
    await db.commit()


# ── System Settings CRUD ──────────────────────────────────────────────────────

@router.get("/settings")
async def get_settings(
    current_user: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(SystemSetting).order_by(SystemSetting.key_name))
    settings = result.scalars().all()
    return {
        "items": [
            {
                "id": str(s.id),
                "key_name": s.key_name,
                "value": s.value,
                "description": s.description,
                "updated_at": s.updated_at.isoformat() if s.updated_at else None,
            }
            for s in settings
        ]
    }


@router.put("/settings/{key_name}")
async def update_setting(
    key_name: str,
    body: SettingUpdate,
    current_user: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_db),
):
    setting = (await db.execute(select(SystemSetting).where(SystemSetting.key_name == key_name))).scalar_one_or_none()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    setting.value = body.value
    await db.commit()
    return {"key_name": setting.key_name, "value": setting.value}
