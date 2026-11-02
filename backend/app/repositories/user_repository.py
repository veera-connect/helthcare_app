from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.core.security import hash_password


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: UUID) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.email == email.lower(), User.deleted_at.is_(None))
        )
        return result.scalar_one_or_none()

    async def create(self, email: str, password: str, role: str) -> User:
        user = User(
            email=email.lower(),
            hashed_password=hash_password(password),
            role=role,
        )
        self.db.add(user)
        await self.db.flush()
        return user

    async def increment_failed_logins(self, user: User) -> None:
        user.failed_login_attempts += 1
        await self.db.flush()

    async def reset_failed_logins(self, user: User) -> None:
        user.failed_login_attempts = 0
        await self.db.flush()
