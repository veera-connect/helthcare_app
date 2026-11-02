from pydantic import BaseModel


class AIMessageRequest(BaseModel):
    message: str
    session_id: str | None = None


class AIMessageResponse(BaseModel):
    message: str
    session_id: str
    is_emergency_redirect: bool = False
    disclaimer: str | None = None
    suggested_actions: list[str] = []


class DocumentSummaryRequest(BaseModel):
    document_id: str
    question: str | None = None


class DocumentSummaryResponse(BaseModel):
    summary: str
    key_points: list[str] = []
    disclaimer: str
