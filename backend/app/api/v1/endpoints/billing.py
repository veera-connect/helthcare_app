from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/billing", tags=["Billing"])


@router.get("/invoices/patient/{patient_id}")
async def get_patient_invoices(
    patient_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.patient and current_user.patient.id != patient_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Access denied")
    # Placeholder until invoices table is added
    return {"items": [], "total": 0, "page": page, "page_size": page_size}
