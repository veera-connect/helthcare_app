from uuid import UUID
from datetime import date
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.models.medical_record import MedicalRecord, Prescription, RecordType
from app.models.user import User, Role
from app.repositories.audit_repository import AuditRepository
from app.models.audit import AuditAction


class MedicalRecordService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.audit_repo = AuditRepository(db)

    def _authorize(self, record: MedicalRecord, requesting_user: User) -> None:
        if requesting_user.role == Role.PATIENT:
            if not requesting_user.patient or record.patient_id != requesting_user.patient.id:
                raise HTTPException(status_code=403, detail="Access denied")

    async def get_by_id(self, record_id: UUID, requesting_user: User) -> MedicalRecord:
        result = await self.db.execute(
            select(MedicalRecord)
            .options(selectinload(MedicalRecord.prescriptions))
            .where(MedicalRecord.id == record_id, MedicalRecord.deleted_at.is_(None))
        )
        record = result.scalar_one_or_none()
        if not record:
            raise HTTPException(status_code=404, detail="Medical record not found")
        self._authorize(record, requesting_user)
        await self.audit_repo.log(
            action=AuditAction.READ,
            actor_id=requesting_user.id,
            resource_type="MedicalRecord",
            resource_id=str(record_id),
        )
        return record

    async def list_for_patient(
        self, patient_id: UUID, page: int, page_size: int, requesting_user: User
    ) -> tuple[list[MedicalRecord], int]:
        if requesting_user.role == Role.PATIENT:
            if not requesting_user.patient or requesting_user.patient.id != patient_id:
                raise HTTPException(status_code=403, detail="Access denied")

        offset = (page - 1) * page_size
        count = await self.db.execute(
            select(func.count()).select_from(MedicalRecord).where(
                MedicalRecord.patient_id == patient_id,
                MedicalRecord.deleted_at.is_(None),
            )
        )
        total = count.scalar_one()
        result = await self.db.execute(
            select(MedicalRecord)
            .options(selectinload(MedicalRecord.prescriptions))
            .where(MedicalRecord.patient_id == patient_id, MedicalRecord.deleted_at.is_(None))
            .order_by(MedicalRecord.record_date.desc())
            .offset(offset)
            .limit(page_size)
        )
        return list(result.scalars().all()), total

    async def create(
        self,
        patient_id: UUID,
        doctor_id: UUID,
        record_type: RecordType,
        title: str,
        record_date: date,
        requesting_user: User,
        **kwargs,
    ) -> MedicalRecord:
        if requesting_user.role not in (Role.DOCTOR, Role.ADMIN):
            raise HTTPException(status_code=403, detail="Only doctors can create medical records")

        prescriptions_data = kwargs.pop("prescriptions", [])
        record = MedicalRecord(
            patient_id=patient_id,
            doctor_id=doctor_id,
            record_type=record_type,
            title=title,
            record_date=record_date,
            **kwargs,
        )
        self.db.add(record)
        await self.db.flush()

        for p in prescriptions_data:
            prescription = Prescription(medical_record_id=record.id, **p.model_dump())
            self.db.add(prescription)

        await self.db.flush()
        await self.audit_repo.log(
            action=AuditAction.CREATE,
            actor_id=requesting_user.id,
            resource_type="MedicalRecord",
            resource_id=str(record.id),
        )
        return record
