from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.models.user import Role
from app.repositories.user_repository import UserRepository
from app.repositories.patient_repository import PatientRepository
from app.repositories.doctor_repository import DoctorRepository
from app.repositories.audit_repository import AuditRepository
from app.models.audit import AuditAction
import logging

logger = logging.getLogger(__name__)

MAX_FAILED_ATTEMPTS = 5


class AuthService:
    def __init__(self, db: AsyncSession):
        self.user_repo = UserRepository(db)
        self.patient_repo = PatientRepository(db)
        self.doctor_repo = DoctorRepository(db)
        self.audit_repo = AuditRepository(db)

    async def login(self, email: str, password: str, ip: str | None = None) -> dict:
        user = await self.user_repo.get_by_email(email)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
            raise HTTPException(status_code=403, detail="Account locked due to too many failed attempts")

        if not verify_password(password, user.hashed_password):
            await self.user_repo.increment_failed_logins(user)
            await self.audit_repo.log(
                action=AuditAction.LOGIN_FAILED,
                actor_id=user.id,
                resource_type="User",
                resource_id=str(user.id),
                ip_address=ip,
            )
            raise HTTPException(status_code=401, detail="Invalid credentials")

        await self.user_repo.reset_failed_logins(user)
        await self.audit_repo.log(
            action=AuditAction.LOGIN,
            actor_id=user.id,
            resource_type="User",
            resource_id=str(user.id),
            ip_address=ip,
        )

        access_token = create_access_token(str(user.id), user.role.value)
        refresh_token = create_refresh_token(str(user.id))
        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

    async def register_patient(self, email: str, password: str, first_name: str, last_name: str) -> dict:
        existing = await self.user_repo.get_by_email(email)
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")

        user = await self.user_repo.create(email=email, password=password, role=Role.PATIENT)
        await self.patient_repo.create(user_id=user.id, first_name=first_name, last_name=last_name)

        access_token = create_access_token(str(user.id), user.role.value)
        refresh_token = create_refresh_token(str(user.id))
        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

    async def refresh_tokens(self, refresh_token: str) -> dict:
        payload = decode_token(refresh_token, token_type="refresh")
        user_id = payload.get("sub")
        user = await self.user_repo.get_by_id(UUID(user_id))
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        access_token = create_access_token(str(user.id), user.role.value)
        new_refresh_token = create_refresh_token(str(user.id))
        return {"access_token": access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}
