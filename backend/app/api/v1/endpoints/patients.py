from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.user import User
from app.schemas.patient import PatientResponse, PatientUpdate, PatientListResponse
from app.services.patient_service import PatientService

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.get("/me", response_model=PatientResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = PatientService(db)
    return await service.get_my_profile(current_user)


@router.put("/me", response_model=PatientResponse)
async def update_my_profile(
    body: PatientUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    patient = await PatientService(db).get_my_profile(current_user)
    return await PatientService(db).update_profile(
        patient.id, current_user, **body.model_dump(exclude_unset=True)
    )


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await PatientService(db).get_by_id(patient_id, current_user)


@router.get("/", response_model=PatientListResponse)
async def list_patients(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    patients, total = await PatientService(db).list_all(page, page_size)
    return PatientListResponse(items=patients, total=total, page=page, page_size=page_size)
