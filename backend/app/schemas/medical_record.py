from uuid import UUID
from datetime import date
from pydantic import BaseModel
from app.models.medical_record import RecordType


class PrescriptionCreate(BaseModel):
    medication_name: str
    dosage: str
    frequency: str
    duration: str | None = None
    instructions: str | None = None
    start_date: date | None = None
    end_date: date | None = None


class PrescriptionResponse(PrescriptionCreate):
    id: UUID
    medical_record_id: UUID

    model_config = {"from_attributes": True}


class MedicalRecordCreate(BaseModel):
    record_type: RecordType
    title: str
    description: str | None = None
    diagnosis: str | None = None
    treatment: str | None = None
    record_date: date
    appointment_id: UUID | None = None
    prescriptions: list[PrescriptionCreate] = []


class MedicalRecordUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    diagnosis: str | None = None
    treatment: str | None = None


class MedicalRecordResponse(BaseModel):
    id: UUID
    patient_id: UUID
    doctor_id: UUID | None
    appointment_id: UUID | None
    record_type: RecordType
    title: str
    description: str | None
    diagnosis: str | None
    treatment: str | None
    record_date: date
    prescriptions: list[PrescriptionResponse] = []

    model_config = {"from_attributes": True}


class MedicalRecordListResponse(BaseModel):
    items: list[MedicalRecordResponse]
    total: int
    page: int
    page_size: int


class MedicalDocumentResponse(BaseModel):
    id: UUID
    patient_id: UUID
    file_name: str
    mime_type: str
    file_size_bytes: int
    description: str | None

    model_config = {"from_attributes": True}
