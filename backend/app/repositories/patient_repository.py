from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.models.patient import Patient


class PatientRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, patient_id: UUID) -> Patient | None:
        result = await self.db.execute(
            select(Patient)
            .where(Patient.id == patient_id, Patient.deleted_at.is_(None))
        )
        return result.scalar_one_or_none()

    async def get_by_user_id(self, user_id: UUID) -> Patient | None:
        result = await self.db.execute(
            select(Patient).where(Patient.user_id == user_id, Patient.deleted_at.is_(None))
        )
        return result.scalar_one_or_none()

    async def list_all(self, page: int = 1, page_size: int = 20) -> tuple[list[Patient], int]:
        offset = (page - 1) * page_size
        count_result = await self.db.execute(
            select(func.count()).select_from(Patient).where(Patient.deleted_at.is_(None))
        )
        total = count_result.scalar_one()
        result = await self.db.execute(
            select(Patient)
            .where(Patient.deleted_at.is_(None))
            .offset(offset)
            .limit(page_size)
        )
        return result.scalars().all(), total

    async def create(self, user_id: UUID, **kwargs) -> Patient:
        patient = Patient(user_id=user_id, **kwargs)
        self.db.add(patient)
        await self.db.flush()
        return patient

    async def update(self, patient: Patient, **kwargs) -> Patient:
        for key, value in kwargs.items():
            if value is not None:
                setattr(patient, key, value)
        await self.db.flush()
        return patient
