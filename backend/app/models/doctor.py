from uuid import UUID, uuid4
from sqlalchemy import String, Text, ForeignKey, Boolean, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, SoftDeleteMixin

doctor_specializations = Table(
    "doctor_specializations",
    Base.metadata,
    Column("doctor_id", ForeignKey("doctors.id", ondelete="CASCADE"), primary_key=True),
    Column("specialization_id", ForeignKey("specializations.id", ondelete="CASCADE"), primary_key=True),
)


class Specialization(Base, TimestampMixin):
    __tablename__ = "specializations"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    doctors: Mapped[list["Doctor"]] = relationship(
        "Doctor", secondary=doctor_specializations, back_populates="specializations"
    )


class Doctor(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "doctors"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    license_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    years_of_experience: Mapped[int | None] = mapped_column(nullable=True)
    consultation_fee: Mapped[float | None] = mapped_column(nullable=True)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="doctor")
    specializations: Mapped[list["Specialization"]] = relationship(
        "Specialization", secondary=doctor_specializations, back_populates="doctors"
    )
    appointments: Mapped[list["Appointment"]] = relationship("Appointment", back_populates="doctor")
    availabilities: Mapped[list["DoctorAvailability"]] = relationship(
        "DoctorAvailability", back_populates="doctor"
    )


class DoctorAvailability(Base, TimestampMixin):
    __tablename__ = "doctor_availabilities"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    doctor_id: Mapped[UUID] = mapped_column(ForeignKey("doctors.id", ondelete="CASCADE"))
    day_of_week: Mapped[int] = mapped_column(nullable=False)  # 0=Monday ... 6=Sunday
    start_time: Mapped[str] = mapped_column(String(5), nullable=False)  # "09:00"
    end_time: Mapped[str] = mapped_column(String(5), nullable=False)    # "17:00"
    slot_duration_minutes: Mapped[int] = mapped_column(default=30, nullable=False)

    doctor: Mapped["Doctor"] = relationship("Doctor", back_populates="availabilities")
