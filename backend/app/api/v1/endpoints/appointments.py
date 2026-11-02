from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentListResponse,
    AppointmentCancelRequest,
)
from app.services.appointment_service import AppointmentService

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.post("/", response_model=AppointmentResponse, status_code=201)
async def book_appointment(
    body: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AppointmentService(db)
    if not current_user.patient:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Only patients can book appointments")
    return await service.book(
        patient_id=current_user.patient.id,
        doctor_id=body.doctor_id,
        scheduled_at=body.scheduled_at,
        reason=body.reason,
        requesting_user=current_user,
    )


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AppointmentService(db).get_by_id(appointment_id, current_user)


@router.post("/{appointment_id}/cancel", response_model=AppointmentResponse)
async def cancel_appointment(
    appointment_id: UUID,
    body: AppointmentCancelRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AppointmentService(db).cancel(appointment_id, body.cancellation_reason, current_user)


@router.get("/patient/{patient_id}", response_model=AppointmentListResponse)
async def list_patient_appointments(
    patient_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    appts, total = await AppointmentService(db).list_for_patient(patient_id, page, page_size, current_user)
    return AppointmentListResponse(items=appts, total=total, page=page, page_size=page_size)


@router.get("/doctor/{doctor_id}", response_model=AppointmentListResponse)
async def list_doctor_appointments(
    doctor_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    appts, total = await AppointmentService(db).list_for_doctor(doctor_id, page, page_size, current_user)
    return AppointmentListResponse(items=appts, total=total, page=page, page_size=page_size)
