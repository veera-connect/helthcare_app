from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.models.doctor import Doctor, Specialization, DoctorAvailability


class DoctorRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, doctor_id: UUID) -> Doctor | None:
        result = await self.db.execute(
            select(Doctor)
            .options(selectinload(Doctor.specializations), selectinload(Doctor.availabilities))
            .where(Doctor.id == doctor_id, Doctor.deleted_at.is_(None))
        )
        return result.scalar_one_or_none()

    async def get_by_user_id(self, user_id: UUID) -> Doctor | None:
        result = await self.db.execute(
            select(Doctor)
            .options(selectinload(Doctor.specializations), selectinload(Doctor.availabilities))
            .where(Doctor.user_id == user_id, Doctor.deleted_at.is_(None))
        )
        return result.scalar_one_or_none()

    async def list_available(
        self,
        specialization_id: UUID | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Doctor], int]:
        offset = (page - 1) * page_size
        query = (
            select(Doctor)
            .options(selectinload(Doctor.specializations), selectinload(Doctor.availabilities))
            .where(Doctor.is_available.is_(True), Doctor.deleted_at.is_(None))
        )
        if specialization_id:
            query = query.join(Doctor.specializations).where(
                Specialization.id == specialization_id
            )
        count_result = await self.db.execute(select(func.count()).select_from(query.subquery()))
        total = count_result.scalar_one()
        result = await self.db.execute(query.offset(offset).limit(page_size))
        return result.scalars().all(), total

    async def create(self, user_id: UUID, **kwargs) -> Doctor:
        specialization_ids = kwargs.pop("specialization_ids", [])
        doctor = Doctor(user_id=user_id, **kwargs)
        if specialization_ids:
            specs = await self.db.execute(
                select(Specialization).where(Specialization.id.in_(specialization_ids))
            )
            doctor.specializations = list(specs.scalars().all())
        self.db.add(doctor)
        await self.db.flush()
        return doctor

    async def get_specializations(self) -> list[Specialization]:
        result = await self.db.execute(select(Specialization))
        return list(result.scalars().all())
