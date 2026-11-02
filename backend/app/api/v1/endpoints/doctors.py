from uuid import UUID
from datetime import date as date_type, timedelta, datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.user import User
from app.models.doctor import Doctor, DoctorAvailability
from app.models.appointment import Appointment, AppointmentStatus
from app.models.patient import Patient
from app.schemas.doctor import DoctorResponse, DoctorUpdate, DoctorListResponse, SpecializationResponse
from app.repositories.doctor_repository import DoctorRepository

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.get("/specializations", response_model=list[SpecializationResponse])
async def list_specializations(db: AsyncSession = Depends(get_db)):
    repo = DoctorRepository(db)
    return await repo.get_specializations()


@router.get("/", response_model=DoctorListResponse)
async def list_doctors(
    specialization_id: UUID | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    repo = DoctorRepository(db)
    doctors, total = await repo.list_available(specialization_id, page, page_size)
    return DoctorListResponse(items=doctors, total=total, page=page, page_size=page_size)


@router.get("/me", response_model=DoctorResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = DoctorRepository(db)
    doctor = await repo.get_by_user_id(current_user.id)
    if not doctor:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    return doctor


@router.get("/{doctor_id}/availability")
async def get_doctor_availability(
    doctor_id: UUID,
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    db: AsyncSession = Depends(get_db),
):
    try:
        target_date = date_type.fromisoformat(date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format; use YYYY-MM-DD")

    # day_of_week: 0=Monday ... 6=Sunday
    day_of_week = target_date.weekday()
    avail_result = await db.execute(
        select(DoctorAvailability)
        .where(DoctorAvailability.doctor_id == doctor_id, DoctorAvailability.day_of_week == day_of_week)
    )
    availabilities = avail_result.scalars().all()
    if not availabilities:
        return []

    # Collect existing booked slots for that day
    day_start = datetime(target_date.year, target_date.month, target_date.day)
    day_end = day_start + timedelta(days=1)
    booked_result = await db.execute(
        select(Appointment.scheduled_at).where(
            Appointment.doctor_id == doctor_id,
            Appointment.scheduled_at >= day_start,
            Appointment.scheduled_at < day_end,
            Appointment.status.in_([AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]),
        )
    )
    booked_times = {row[0].strftime("%H:%M") for row in booked_result.all()}

    slots: list[str] = []
    for av in availabilities:
        h, m = map(int, av.start_time.split(":"))
        eh, em = map(int, av.end_time.split(":"))
        current = h * 60 + m
        end = eh * 60 + em
        while current + av.slot_duration_minutes <= end:
            slot = f"{current // 60:02d}:{current % 60:02d}"
            if slot not in booked_times:
                slots.append(slot)
            current += av.slot_duration_minutes
    return slots


@router.get("/{doctor_id}/patients")
async def get_doctor_patients(
    doctor_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Get distinct patients who have appointments with this doctor
    subq = (
        select(Appointment.patient_id)
        .where(Appointment.doctor_id == doctor_id)
        .distinct()
        .subquery()
    )
    total_result = await db.execute(select(func.count()).select_from(subq))
    total = total_result.scalar()

    result = await db.execute(
        select(Patient)
        .where(Patient.id.in_(select(subq)))
        .where(Patient.deleted_at.is_(None))
        .order_by(Patient.first_name)
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    patients = result.scalars().all()
    return {
        "items": [
            {
                "id": str(p.id),
                "first_name": p.first_name,
                "last_name": p.last_name,
                "blood_group": p.blood_group.value if p.blood_group else None,
                "phone": p.phone,
                "date_of_birth": p.date_of_birth.isoformat() if p.date_of_birth else None,
            }
            for p in patients
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/{doctor_id}/appointments")
async def get_doctor_appointments(
    doctor_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy.orm import selectinload as _sil
    from app.models.appointment import Appointment, AppointmentStatus

    # Doctors can only see their own appointments; admins can see any
    if current_user.role.value == "doctor":
        if not current_user.doctor or current_user.doctor.id != doctor_id:
            raise HTTPException(status_code=403, detail="Access denied")

    q = (
        select(Appointment)
        .options(_sil(Appointment.patient))
        .where(Appointment.doctor_id == doctor_id)
    )
    if status:
        try:
            q = q.where(Appointment.status == AppointmentStatus(status))
        except ValueError:
            pass

    total_q = select(func.count()).select_from(Appointment).where(Appointment.doctor_id == doctor_id)
    total = (await db.execute(total_q)).scalar()

    result = await db.execute(
        q.order_by(Appointment.scheduled_at.asc()).offset((page - 1) * page_size).limit(page_size)
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
            }
            for a in appts
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/{doctor_id}", response_model=DoctorResponse)
async def get_doctor(doctor_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = DoctorRepository(db)
    doctor = await repo.get_by_id(doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor
