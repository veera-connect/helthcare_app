from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.patient_repository import PatientRepository
from app.repositories.audit_repository import AuditRepository
from app.models.user import User, Role
from app.models.audit import AuditAction


class PatientService:
    def __init__(self, db: AsyncSession):
        self.patient_repo = PatientRepository(db)
        self.audit_repo = AuditRepository(db)

    def _authorize(self, patient_id: UUID, requesting_user: User) -> None:
        if requesting_user.role == Role.PATIENT:
            if not requesting_user.patient or requesting_user.patient.id != patient_id:
                raise HTTPException(status_code=403, detail="Access denied")

    async def get_by_id(self, patient_id: UUID, requesting_user: User):
        self._authorize(patient_id, requesting_user)
        patient = await self.patient_repo.get_by_id(patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        await self.audit_repo.log(
            action=AuditAction.READ,
            actor_id=requesting_user.id,
            resource_type="Patient",
            resource_id=str(patient_id),
        )
        return patient

    async def get_my_profile(self, requesting_user: User):
        patient = await self.patient_repo.get_by_user_id(requesting_user.id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        return patient

    async def update_profile(self, patient_id: UUID, requesting_user: User, **kwargs):
        self._authorize(patient_id, requesting_user)
        patient = await self.patient_repo.get_by_id(patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        updated = await self.patient_repo.update(patient, **{k: v for k, v in kwargs.items() if v is not None})
        await self.audit_repo.log(
            action=AuditAction.UPDATE,
            actor_id=requesting_user.id,
            resource_type="Patient",
            resource_id=str(patient_id),
        )
        return updated

    async def list_all(self, page: int = 1, page_size: int = 20):
        patients, total = await self.patient_repo.list_all(page, page_size)
        return patients, total
