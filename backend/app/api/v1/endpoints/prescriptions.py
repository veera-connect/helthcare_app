from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.medical_record import Prescription, MedicalRecord

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


@router.get("/patient/{patient_id}")
async def get_patient_prescriptions(
    patient_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.patient and current_user.patient.id != patient_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Access denied")

    result = await db.execute(
        select(Prescription)
        .join(MedicalRecord)
        .where(MedicalRecord.patient_id == patient_id, MedicalRecord.deleted_at.is_(None))
        .order_by(Prescription.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = result.scalars().all()
    return {
        "items": [
            {
                "id": str(p.id),
                "medication_name": p.medication_name,
                "dosage": p.dosage,
                "frequency": p.frequency,
                "duration": p.duration,
                "instructions": p.instructions,
                "start_date": p.start_date.isoformat() if p.start_date else None,
                "end_date": p.end_date.isoformat() if p.end_date else None,
                "created_at": p.created_at.isoformat() if hasattr(p, "created_at") and p.created_at else None,
            }
            for p in items
        ],
        "total": len(items),
        "page": page,
        "page_size": page_size,
    }


@router.get("/doctor/{doctor_id}")
async def get_doctor_prescriptions(
    doctor_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Prescription)
        .join(MedicalRecord)
        .where(MedicalRecord.doctor_id == doctor_id, MedicalRecord.deleted_at.is_(None))
        .order_by(Prescription.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = result.scalars().all()
    return {
        "items": [
            {
                "id": str(p.id),
                "medication_name": p.medication_name,
                "dosage": p.dosage,
                "frequency": p.frequency,
                "duration": p.duration,
                "start_date": p.start_date.isoformat() if p.start_date else None,
                "end_date": p.end_date.isoformat() if p.end_date else None,
            }
            for p in items
        ],
        "total": len(items),
        "page": page,
        "page_size": page_size,
    }
