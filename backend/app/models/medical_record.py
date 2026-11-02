import enum
from uuid import UUID, uuid4
from datetime import date
from sqlalchemy import String, Text, ForeignKey, Date, Enum as SAEnum, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, SoftDeleteMixin


class RecordType(str, enum.Enum):
    CONSULTATION = "consultation"
    LAB_REPORT = "lab_report"
    PRESCRIPTION = "prescription"
    IMAGING = "imaging"
    SURGERY = "surgery"
    DISCHARGE_SUMMARY = "discharge_summary"
    OTHER = "other"


class MedicalRecord(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "medical_records"
    __table_args__ = (Index("ix_medical_record_patient", "patient_id"),)

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    patient_id: Mapped[UUID] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"))
    doctor_id: Mapped[UUID | None] = mapped_column(ForeignKey("doctors.id", ondelete="SET NULL"), nullable=True)
    appointment_id: Mapped[UUID | None] = mapped_column(ForeignKey("appointments.id", ondelete="SET NULL"), nullable=True)
    record_type: Mapped[RecordType] = mapped_column(SAEnum(RecordType, values_callable=lambda x: [e.value for e in x]), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    diagnosis: Mapped[str | None] = mapped_column(Text, nullable=True)
    treatment: Mapped[str | None] = mapped_column(Text, nullable=True)
    record_date: Mapped[date] = mapped_column(Date, nullable=False)

    patient: Mapped["Patient"] = relationship("Patient", back_populates="medical_records")
    doctor: Mapped["Doctor | None"] = relationship("Doctor")
    prescriptions: Mapped[list["Prescription"]] = relationship("Prescription", back_populates="medical_record")


class Prescription(Base, TimestampMixin):
    __tablename__ = "prescriptions"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    medical_record_id: Mapped[UUID] = mapped_column(ForeignKey("medical_records.id", ondelete="CASCADE"))
    medication_name: Mapped[str] = mapped_column(String(200), nullable=False)
    dosage: Mapped[str] = mapped_column(String(100), nullable=False)
    frequency: Mapped[str] = mapped_column(String(100), nullable=False)
    duration: Mapped[str | None] = mapped_column(String(100), nullable=True)
    instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    medical_record: Mapped["MedicalRecord"] = relationship("MedicalRecord", back_populates="prescriptions")


class MedicalDocument(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "medical_documents"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    patient_id: Mapped[UUID] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"))
    medical_record_id: Mapped[UUID | None] = mapped_column(ForeignKey("medical_records.id", ondelete="SET NULL"), nullable=True)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)

    patient: Mapped["Patient"] = relationship("Patient", back_populates="medical_documents")
