from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.appointment import Appointment, AppointmentStatus


class AppointmentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, appointment_id: UUID) -> Appointment | None:
        result = await self.db.execute(
            select(Appointment).where(Appointment.id == appointment_id)
        )
        return result.scalar_one_or_none()

    async def list_by_patient(
        self, patient_id: UUID, page: int = 1, page_size: int = 20
    ) -> tuple[list[Appointment], int]:
        offset = (page - 1) * page_size
        count = await self.db.execute(
            select(func.count()).select_from(Appointment).where(Appointment.patient_id == patient_id)
        )
        total = count.scalar_one()
        result = await self.db.execute(
            select(Appointment)
            .where(Appointment.patient_id == patient_id)
            .order_by(Appointment.scheduled_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        return list(result.scalars().all()), total

    async def list_by_doctor(
        self, doctor_id: UUID, page: int = 1, page_size: int = 20
    ) -> tuple[list[Appointment], int]:
        offset = (page - 1) * page_size
        count = await self.db.execute(
            select(func.count()).select_from(Appointment).where(Appointment.doctor_id == doctor_id)
        )
        total = count.scalar_one()
        result = await self.db.execute(
            select(Appointment)
            .where(Appointment.doctor_id == doctor_id)
            .order_by(Appointment.scheduled_at.asc())
            .offset(offset)
            .limit(page_size)
        )
        return list(result.scalars().all()), total

    async def is_slot_taken(self, doctor_id: UUID, scheduled_at: datetime, duration_minutes: int = 30) -> bool:
        from datetime import timedelta
        end_at = scheduled_at + timedelta(minutes=duration_minutes)
        result = await self.db.execute(
            select(Appointment).where(
                and_(
                    Appointment.doctor_id == doctor_id,
                    Appointment.status.notin_([AppointmentStatus.CANCELLED]),
                    Appointment.scheduled_at < end_at,
                )
            )
        )
        return result.scalar_one_or_none() is not None

    async def create(self, patient_id: UUID, doctor_id: UUID, scheduled_at: datetime, **kwargs) -> Appointment:
        appt = Appointment(patient_id=patient_id, doctor_id=doctor_id, scheduled_at=scheduled_at, **kwargs)
        self.db.add(appt)
        await self.db.flush()
        return appt

    async def update_status(self, appointment: Appointment, status: AppointmentStatus, **kwargs) -> Appointment:
        appointment.status = status
        for key, value in kwargs.items():
            setattr(appointment, key, value)
        await self.db.flush()
        return appointment
