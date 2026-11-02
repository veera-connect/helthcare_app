from uuid import UUID
from datetime import datetime
from pydantic import BaseModel
from app.models.appointment import AppointmentStatus


class AppointmentCreate(BaseModel):
    doctor_id: UUID
    scheduled_at: datetime
    reason: str | None = None


class AppointmentUpdate(BaseModel):
    scheduled_at: datetime | None = None
    reason: str | None = None
    notes: str | None = None


class AppointmentCancelRequest(BaseModel):
    cancellation_reason: str | None = None


class AppointmentResponse(BaseModel):
    id: UUID
    patient_id: UUID
    doctor_id: UUID
    scheduled_at: datetime
    duration_minutes: int
    status: AppointmentStatus
    reason: str | None = None
    notes: str | None = None
    cancellation_reason: str | None = None

    model_config = {"from_attributes": True}


class AppointmentListResponse(BaseModel):
    items: list[AppointmentResponse]
    total: int
    page: int
    page_size: int


class TimeSlot(BaseModel):
    start: datetime
    end: datetime
    available: bool
