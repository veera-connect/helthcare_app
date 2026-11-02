from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.medical_record import MedicalRecordCreate, MedicalRecordResponse, MedicalRecordListResponse
from app.services.medical_record_service import MedicalRecordService

router = APIRouter(prefix="/medical-records", tags=["Medical Records"])


@router.post("/", response_model=MedicalRecordResponse, status_code=201)
async def create_medical_record(
    body: MedicalRecordCreate,
    patient_id: UUID = Query(..., description="Patient the record belongs to"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MedicalRecordService(db)
    if not current_user.doctor:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Only doctors can create medical records")
    return await service.create(
        patient_id=patient_id,
        doctor_id=current_user.doctor.id,
        record_type=body.record_type,
        title=body.title,
        record_date=body.record_date,
        requesting_user=current_user,
        description=body.description,
        diagnosis=body.diagnosis,
        treatment=body.treatment,
        appointment_id=body.appointment_id,
        prescriptions=body.prescriptions,
    )


@router.get("/{record_id}", response_model=MedicalRecordResponse)
async def get_medical_record(
    record_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await MedicalRecordService(db).get_by_id(record_id, current_user)


@router.get("/patient/{patient_id}", response_model=MedicalRecordListResponse)
async def list_patient_records(
    patient_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    records, total = await MedicalRecordService(db).list_for_patient(patient_id, page, page_size, current_user)
    return MedicalRecordListResponse(items=records, total=total, page=page, page_size=page_size)
