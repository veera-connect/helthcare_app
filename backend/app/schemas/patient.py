from uuid import UUID
from datetime import date
from pydantic import BaseModel, EmailStr
from app.models.patient import BloodGroup, Gender


class PatientBase(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date | None = None
    gender: Gender | None = None
    phone: str | None = None
    address: str | None = None
    blood_group: BloodGroup = BloodGroup.UNKNOWN
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None


class PatientCreate(PatientBase):
    email: EmailStr
    password: str


class PatientUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    date_of_birth: date | None = None
    gender: Gender | None = None
    phone: str | None = None
    address: str | None = None
    blood_group: BloodGroup | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None


class PatientResponse(PatientBase):
    id: UUID
    user_id: UUID

    model_config = {"from_attributes": True}


class PatientListResponse(BaseModel):
    items: list[PatientResponse]
    total: int
    page: int
    page_size: int
