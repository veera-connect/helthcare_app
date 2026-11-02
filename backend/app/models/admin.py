from uuid import UUID, uuid4
from sqlalchemy import String, Text, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin


class HospitalService(Base, TimestampMixin):
    __tablename__ = "hospital_services"
    __table_args__ = {'schema': 'healthcare_admin'}

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    icon_name: Mapped[str] = mapped_column(String(50), nullable=False, default="Heart")
    color_gradient: Mapped[str] = mapped_column(String(120), nullable=False, default="from-primary-400 to-primary-600")
    bg_class: Mapped[str] = mapped_column(String(120), nullable=False, default="bg-primary-50 dark:bg-primary-950/30")
    availability: Mapped[str] = mapped_column(String(100), nullable=False, default="Mon-Fri")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    patient_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    doctor_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class SystemSetting(Base, TimestampMixin):
    __tablename__ = "system_settings"
    __table_args__ = {'schema': 'healthcare_admin'}

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    key_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
