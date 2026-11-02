"""Synthetic seed data for development. No real patient information."""

import asyncio
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.core.config import settings
from app.core.security import hash_password
from app.models import Base, User, Role, Patient, Doctor, Specialization, DoctorAvailability, Gender, BloodGroup


async def _ensure_databases(setup_url: str) -> None:
    """Create the 3 databases if they don't exist."""
    engine = create_async_engine(setup_url, echo=False)
    async with engine.begin() as conn:
        await conn.execute(text("CREATE DATABASE IF NOT EXISTS healthcare_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
        await conn.execute(text("CREATE DATABASE IF NOT EXISTS healthcare_doctors CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
        await conn.execute(text("CREATE DATABASE IF NOT EXISTS healthcare_patients CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
    await engine.dispose()
    print("Databases ensured: healthcare_admin, healthcare_doctors, healthcare_patients")


async def _get_or_create_spec(db: AsyncSession, name: str, description: str) -> Specialization:
    result = await db.execute(select(Specialization).where(Specialization.name == name))
    existing = result.scalar_one_or_none()
    if existing:
        return existing
    spec = Specialization(name=name, description=description)
    db.add(spec)
    await db.flush()
    return spec


async def _user_exists(db: AsyncSession, email: str) -> bool:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none() is not None


async def seed(db: AsyncSession) -> None:
    specs = [
        await _get_or_create_spec(db, "General Practice", "Primary care and general health"),
        await _get_or_create_spec(db, "Cardiology", "Heart and cardiovascular conditions"),
        await _get_or_create_spec(db, "Dermatology", "Skin conditions and treatments"),
        await _get_or_create_spec(db, "Orthopedics", "Bone, joint, and muscle conditions"),
        await _get_or_create_spec(db, "Pediatrics", "Children's health care"),
    ]

    if not await _user_exists(db, "admin@healthcare.com"):
        admin_user = User(
            email="admin@healthcare.com",
            hashed_password=hash_password("Admin@12345"),
            role=Role.ADMIN,
            is_active=True,
            is_verified=True,
        )
        db.add(admin_user)
        await db.flush()

    doctor_data = [
        {"email": "dr.smith@healthcare.com", "first_name": "James", "last_name": "Smith", "license": "MD-001-2024", "spec": specs[0]},
        {"email": "dr.jones@healthcare.com", "first_name": "Sarah", "last_name": "Jones", "license": "MD-002-2024", "spec": specs[1]},
        {"email": "dr.patel@healthcare.com", "first_name": "Raj",   "last_name": "Patel", "license": "MD-003-2024", "spec": specs[2]},
    ]

    for d in doctor_data:
        if await _user_exists(db, d["email"]):
            continue
        user = User(
            email=d["email"],
            hashed_password=hash_password("Doctor@12345"),
            role=Role.DOCTOR,
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        await db.flush()
        doctor = Doctor(
            user_id=user.id,
            first_name=d["first_name"],
            last_name=d["last_name"],
            license_number=d["license"],
            consultation_fee=150.0,
            years_of_experience=10,
            is_available=True,
        )
        doctor.specializations = [d["spec"]]
        db.add(doctor)
        await db.flush()
        for day in range(5):
            db.add(DoctorAvailability(
                doctor_id=doctor.id,
                day_of_week=day,
                start_time="09:00",
                end_time="17:00",
                slot_duration_minutes=30,
            ))

    patient_data = [
        {"email": "alice@patient.com", "first_name": "Alice", "last_name": "Johnson", "gender": Gender.FEMALE, "blood_group": BloodGroup.A_POS},
        {"email": "bob@patient.com",   "first_name": "Bob",   "last_name": "Williams","gender": Gender.MALE,   "blood_group": BloodGroup.O_NEG},
    ]

    for p in patient_data:
        if await _user_exists(db, p["email"]):
            continue
        user = User(
            email=p["email"],
            hashed_password=hash_password("Patient@12345"),
            role=Role.PATIENT,
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        await db.flush()
        patient = Patient(
            user_id=user.id,
            first_name=p["first_name"],
            last_name=p["last_name"],
            gender=p["gender"],
            blood_group=p["blood_group"],
        )
        db.add(patient)

    await db.commit()
    print("Seed complete (existing records skipped).")
    print("\nDemo Accounts:")
    print("  Admin:    admin@healthcare.com    / Admin@12345")
    print("  Doctor:   dr.smith@healthcare.com / Doctor@12345")
    print("  Patient:  alice@patient.com       / Patient@12345")


async def main():
    await _ensure_databases(settings.SETUP_DATABASE_URL)
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
    async with SessionLocal() as session:
        await seed(session)
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
