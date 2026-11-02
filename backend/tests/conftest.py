import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.main import app
from app.core.database import get_db
from app.models import Base, User, Role, Patient
from app.core.security import hash_password, create_access_token

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture(scope="function")
async def db_session():
    engine = create_async_engine(TEST_DATABASE_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
    async with SessionLocal() as session:
        yield session
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession):
    app.dependency_overrides[get_db] = lambda: db_session
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def patient_user(db_session: AsyncSession):
    user = User(
        email="patient@test.com",
        hashed_password=hash_password("Test@1234"),
        role=Role.PATIENT,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.flush()
    patient = Patient(
        user_id=user.id,
        first_name="Test",
        last_name="Patient",
    )
    db_session.add(patient)
    await db_session.commit()
    return user


@pytest_asyncio.fixture
async def patient_headers(patient_user: User):
    token = create_access_token(str(patient_user.id), "patient")
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def admin_user(db_session: AsyncSession):
    user = User(
        email="admin@test.com",
        hashed_password=hash_password("Admin@1234"),
        role=Role.ADMIN,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    return user


@pytest_asyncio.fixture
async def admin_headers(admin_user: User):
    token = create_access_token(str(admin_user.id), "admin")
    return {"Authorization": f"Bearer {token}"}
