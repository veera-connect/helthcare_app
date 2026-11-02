from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.ai_assistant import AIMessageRequest, AIMessageResponse, DocumentSummaryRequest, DocumentSummaryResponse
from app.agents.healthcare_ai import HealthcareAIOrchestrator
from app.repositories.audit_repository import AuditRepository
from app.models.audit import AuditAction

router = APIRouter(prefix="/ai", tags=["AI Healthcare Assistant"])

_orchestrator = HealthcareAIOrchestrator()


@router.post("/chat", response_model=AIMessageResponse)
async def chat_with_assistant(
    body: AIMessageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a message to the Healthcare AI Assistant."""
    if not current_user.patient:
        raise HTTPException(status_code=403, detail="AI assistant is available to patients only")

    audit_repo = AuditRepository(db)
    await audit_repo.log(
        action=AuditAction.AI_QUERY,
        actor_id=current_user.id,
        resource_type="AIAssistant",
    )

    return await _orchestrator.chat(
        message=body.message,
        patient_id=str(current_user.patient.id),
        session_id=body.session_id,
    )


@router.post("/summarize-document", response_model=DocumentSummaryResponse)
async def summarize_document(
    body: DocumentSummaryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Summarize a medical document using the AI assistant."""
    if not current_user.patient:
        raise HTTPException(status_code=403, detail="Only patients can use document summarization")

    # In a real implementation, fetch and verify the document belongs to this patient
    # For now, accept text directly via the request (document_id would be used to fetch)
    raise HTTPException(
        status_code=501,
        detail="Document summarization requires file retrieval — implement storage integration first",
    )
