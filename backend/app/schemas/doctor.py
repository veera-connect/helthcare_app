from uuid import UUID
from pydantic import BaseModel, EmailStr


class SpecializationResponse(BaseModel):
    id: UUID
    name: str
    description: str | None = None

    model_config = {"from_attributes": True}


class AvailabilityResponse(BaseModel):
    id: UUID
    day_of_week: int
    start_time: str
    end_time: str
    slot_duration_minutes: int

    model_config = {"from_attributes": True}


class AvailabilityCreate(BaseModel):
    day_of_week: int
    start_time: str
    end_time: str
    slot_duration_minutes: int = 30


class DoctorBase(BaseModel):
    first_name: str
    last_name: str
    license_number: str
    phone: str | None = None
    bio: str | None = None
    years_of_experience: int | None = None
    consultation_fee: float | None = None


class DoctorCreate(DoctorBase):
    email: EmailStr
    password: str
    specialization_ids: list[UUID] = []


class DoctorUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    bio: str | None = None
    years_of_experience: int | None = None
    consultation_fee: float | None = None
    is_available: bool | None = None
    specialization_ids: list[UUID] | None = None


class DoctorResponse(DoctorBase):
    id: UUID
    user_id: UUID
    is_available: bool
    specializations: list[SpecializationResponse] = []
    availabilities: list[AvailabilityResponse] = []

    model_config = {"from_attributes": True}


class DoctorListResponse(BaseModel):
    items: list[DoctorResponse]
    total: int
    page: int
    page_size: int
