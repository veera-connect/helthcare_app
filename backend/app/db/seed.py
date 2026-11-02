"""Synthetic seed data for development. No real patient information."""

import asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.core.config import settings
from app.core.security import hash_password
from app.models import Base, User, Role, Patient, Doctor, Specialization, DoctorAvailability, Gender, BloodGroup


async def seed(db: AsyncSession) -> None:
    # Specializations
    specs = [
        Specialization(name="General Practice", description="Primary care and general health"),
        Specialization(name="Cardiology", description="Heart and cardiovascular conditions"),
        Specialization(name="Dermatology", description="Skin conditions and treatments"),
        Specialization(name="Orthopedics", description="Bone, joint, and muscle conditions"),
        Specialization(name="Pediatrics", description="Children's health care"),
    ]
    for s in specs:
        db.add(s)
    await db.flush()

    # Admin user
    admin_user = User(
        email="admin@healthcare.demo",
        hashed_password=hash_password("Admin@12345"),
        role=Role.ADMIN,
        is_active=True,
        is_verified=True,
    )
    db.add(admin_user)
    await db.flush()

    # Doctor users
    doctor_data = [
        {"email": "dr.smith@healthcare.demo", "first_name": "James", "last_name": "Smith", "license": "MD-001-2024", "spec": specs[0]},
        {"email": "dr.jones@healthcare.demo", "first_name": "Sarah", "last_name": "Jones", "license": "MD-002-2024", "spec": specs[1]},
        {"email": "dr.patel@healthcare.demo", "first_name": "Raj", "last_name": "Patel", "license": "MD-003-2024", "spec": specs[2]},
    ]

    for d in doctor_data:
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

        for day in range(5):  # Mon–Fri
            db.add(DoctorAvailability(
                doctor_id=doctor.id,
                day_of_week=day,
                start_time="09:00",
                end_time="17:00",
                slot_duration_minutes=30,
            ))

    # Patient users
    patient_data = [
        {"email": "alice@patient.demo", "first_name": "Alice", "last_name": "Johnson", "gender": Gender.FEMALE, "blood_group": BloodGroup.A_POS},
        {"email": "bob@patient.demo", "first_name": "Bob", "last_name": "Williams", "gender": Gender.MALE, "blood_group": BloodGroup.O_NEG},
    ]

    for p in patient_data:
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
    print("Seed data inserted successfully.")
    print("\nDemo Accounts:")
    print("  Admin:    admin@healthcare.demo    / Admin@12345")
    print("  Doctor:   dr.smith@healthcare.demo / Doctor@12345")
    print("  Patient:  alice@patient.demo       / Patient@12345")


async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
    async with SessionLocal() as session:
        await seed(session)
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
