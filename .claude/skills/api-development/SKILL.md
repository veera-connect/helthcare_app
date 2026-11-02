# API Development Skill

## Description
Best practices for building FastAPI endpoints in the healthcare application.

## When to Use
- Creating a new API endpoint
- Reviewing an existing endpoint for correctness
- Designing a new service or repository

## Instructions

### Router Template
```python
from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from app.core.deps import get_current_user, require_role
from app.schemas.patient import PatientResponse, PatientUpdate
from app.services.patient_service import PatientService

router = APIRouter(prefix="/patients", tags=["patients"])

@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: UUID,
    current_user: User = Depends(get_current_user),
    service: PatientService = Depends(),
) -> PatientResponse:
    patient = await service.get_by_id(patient_id, requesting_user=current_user)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient
```

### Service Template
```python
class PatientService:
    def __init__(self, repo: PatientRepository = Depends()):
        self.repo = repo

    async def get_by_id(self, patient_id: UUID, requesting_user: User) -> Patient | None:
        self._authorize_access(patient_id, requesting_user)
        return await self.repo.get_by_id(patient_id)

    def _authorize_access(self, patient_id: UUID, user: User) -> None:
        if user.role == Role.PATIENT and user.patient_id != patient_id:
            raise HTTPException(status_code=403, detail="Access denied")
```

### Repository Template
```python
class PatientRepository:
    def __init__(self, db: AsyncSession = Depends(get_db)):
        self.db = db

    async def get_by_id(self, patient_id: UUID) -> Patient | None:
        result = await self.db.execute(
            select(Patient).where(Patient.id == patient_id)
        )
        return result.scalar_one_or_none()
```

## Validation
An endpoint is complete when:
- [ ] It has an authentication dependency
- [ ] Its service method checks authorization
- [ ] All inputs are Pydantic-validated
- [ ] It returns a typed Pydantic response model
- [ ] It has at least one test (success + unauthorized)
