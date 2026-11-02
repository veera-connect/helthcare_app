import enum
from uuid import UUID, uuid4
from datetime import date
from sqlalchemy import String, Date, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, SoftDeleteMixin


class BloodGroup(str, enum.Enum):
    A_POS = "A+"
    A_NEG = "A-"
    B_POS = "B+"
    B_NEG = "B-"
    AB_POS = "AB+"
    AB_NEG = "AB-"
    O_POS = "O+"
    O_NEG = "O-"
    UNKNOWN = "Unknown"


class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class Patient(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "patients"
    __table_args__ = {'schema': 'healthcare_patients'}

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("healthcare_admin.users.id", ondelete="CASCADE"), unique=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[Gender | None] = mapped_column(SAEnum(Gender, values_callable=lambda x: [e.value for e in x]), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    blood_group: Mapped[BloodGroup] = mapped_column(
        SAEnum(BloodGroup, values_callable=lambda x: [e.value for e in x]), default=BloodGroup.UNKNOWN, nullable=False
    )
    emergency_contact_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    emergency_contact_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="patient")
    appointments: Mapped[list["Appointment"]] = relationship("Appointment", back_populates="patient")
    medical_records: Mapped[list["MedicalRecord"]] = relationship("MedicalRecord", back_populates="patient")
    medical_documents: Mapped[list["MedicalDocument"]] = relationship("MedicalDocument", back_populates="patient")
