from uuid import UUID
from datetime import datetime, timezone
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.appointment_repository import AppointmentRepository
from app.repositories.audit_repository import AuditRepository
from app.models.user import User, Role
from app.models.appointment import AppointmentStatus
from app.models.audit import AuditAction


class AppointmentService:
    def __init__(self, db: AsyncSession):
        self.appt_repo = AppointmentRepository(db)
        self.audit_repo = AuditRepository(db)

    def _authorize_access(self, appointment, requesting_user: User) -> None:
        if requesting_user.role == Role.PATIENT:
            if not requesting_user.patient or appointment.patient_id != requesting_user.patient.id:
                raise HTTPException(status_code=403, detail="Access denied")
        elif requesting_user.role == Role.DOCTOR:
            if not requesting_user.doctor or appointment.doctor_id != requesting_user.doctor.id:
                raise HTTPException(status_code=403, detail="Access denied")

    async def book(
        self, patient_id: UUID, doctor_id: UUID, scheduled_at: datetime,
        reason: str | None, requesting_user: User
    ):
        if scheduled_at <= datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Appointment must be in the future")

        if await self.appt_repo.is_slot_taken(doctor_id, scheduled_at):
            raise HTTPException(status_code=409, detail="This time slot is already booked")

        appt = await self.appt_repo.create(
            patient_id=patient_id,
            doctor_id=doctor_id,
            scheduled_at=scheduled_at,
            reason=reason,
        )
        await self.audit_repo.log(
            action=AuditAction.CREATE,
            actor_id=requesting_user.id,
            resource_type="Appointment",
            resource_id=str(appt.id),
        )
        return appt

    async def cancel(self, appointment_id: UUID, cancellation_reason: str | None, requesting_user: User):
        appt = await self.appt_repo.get_by_id(appointment_id)
        if not appt:
            raise HTTPException(status_code=404, detail="Appointment not found")
        self._authorize_access(appt, requesting_user)
        if appt.status == AppointmentStatus.CANCELLED:
            raise HTTPException(status_code=400, detail="Appointment is already cancelled")
        if appt.status == AppointmentStatus.COMPLETED:
            raise HTTPException(status_code=400, detail="Cannot cancel a completed appointment")

        updated = await self.appt_repo.update_status(
            appt,
            AppointmentStatus.CANCELLED,
            cancellation_reason=cancellation_reason,
            cancelled_at=datetime.now(timezone.utc),
        )
        await self.audit_repo.log(
            action=AuditAction.UPDATE,
            actor_id=requesting_user.id,
            resource_type="Appointment",
            resource_id=str(appointment_id),
            details="Cancelled",
        )
        return updated

    async def get_by_id(self, appointment_id: UUID, requesting_user: User):
        appt = await self.appt_repo.get_by_id(appointment_id)
        if not appt:
            raise HTTPException(status_code=404, detail="Appointment not found")
        self._authorize_access(appt, requesting_user)
        return appt

    async def list_for_patient(self, patient_id: UUID, page: int, page_size: int, requesting_user: User):
        if requesting_user.role == Role.PATIENT:
            if not requesting_user.patient or requesting_user.patient.id != patient_id:
                raise HTTPException(status_code=403, detail="Access denied")
        appts, total = await self.appt_repo.list_by_patient(patient_id, page, page_size)
        return appts, total

    async def list_for_doctor(self, doctor_id: UUID, page: int, page_size: int, requesting_user: User):
        if requesting_user.role == Role.DOCTOR:
            if not requesting_user.doctor or requesting_user.doctor.id != doctor_id:
                raise HTTPException(status_code=403, detail="Access denied")
        appts, total = await self.appt_repo.list_by_doctor(doctor_id, page, page_size)
        return appts, total
