from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.user import User
from app.schemas.doctor import DoctorResponse, DoctorUpdate, DoctorListResponse, SpecializationResponse
from app.repositories.doctor_repository import DoctorRepository

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.get("/specializations", response_model=list[SpecializationResponse])
async def list_specializations(db: AsyncSession = Depends(get_db)):
    repo = DoctorRepository(db)
    return await repo.get_specializations()


@router.get("/", response_model=DoctorListResponse)
async def list_doctors(
    specialization_id: UUID | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    repo = DoctorRepository(db)
    doctors, total = await repo.list_available(specialization_id, page, page_size)
    return DoctorListResponse(items=doctors, total=total, page=page, page_size=page_size)


@router.get("/me", response_model=DoctorResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = DoctorRepository(db)
    doctor = await repo.get_by_user_id(current_user.id)
    if not doctor:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    return doctor


@router.get("/{doctor_id}", response_model=DoctorResponse)
async def get_doctor(doctor_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = DoctorRepository(db)
    doctor = await repo.get_by_id(doctor_id)
    if not doctor:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor
