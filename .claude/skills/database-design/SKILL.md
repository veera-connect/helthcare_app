# Database Design Skill

## Description
Patterns for PostgreSQL schema design and SQLAlchemy models in the healthcare application.

## When to Use
- Designing a new database table
- Writing SQLAlchemy models
- Creating Alembic migration scripts
- Optimizing slow queries

## Instructions

### Base Model
```python
# backend/app/models/base.py
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import func
from uuid import UUID, uuid4
from datetime import datetime

class Base(DeclarativeBase):
    pass

class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now(), nullable=False)

class SoftDeleteMixin:
    deleted_at: Mapped[datetime | None] = mapped_column(nullable=True, default=None)
```

### UUID Primary Key
```python
id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
```

### Enum Columns
```python
import enum
from sqlalchemy import Enum as SAEnum

class AppointmentStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

status: Mapped[AppointmentStatus] = mapped_column(SAEnum(AppointmentStatus), nullable=False)
```

### Relationships
```python
# One-to-many: Doctor → Appointments
appointments: Mapped[list["Appointment"]] = relationship("Appointment", back_populates="doctor", lazy="select")

# Many-to-one: Appointment → Doctor
doctor: Mapped["Doctor"] = relationship("Doctor", back_populates="appointments")
```

### Indexes
```python
from sqlalchemy import Index

__table_args__ = (
    Index("ix_appointments_patient_status", "patient_id", "status"),
    Index("ix_appointments_doctor_date", "doctor_id", "scheduled_at"),
)
```

### Migration Commands
```bash
# Create migration after model change
alembic revision --autogenerate -m "add appointments table"

# Apply all pending migrations
alembic upgrade head

# Downgrade one step
alembic downgrade -1
```

## Validation
A schema is complete when:
- [ ] All foreign keys have explicit `ondelete` policies
- [ ] All frequently queried columns have indexes
- [ ] Migration is reversible (`downgrade()` implemented)
- [ ] No plain-text sensitive data stored unencrypted
