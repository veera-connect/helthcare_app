import uuid
import re
from app.integrations.gemini_client import get_gemini_model
from app.schemas.ai_assistant import AIMessageResponse, DocumentSummaryResponse

HEALTHCARE_SYSTEM_PROMPT = """You are a helpful Healthcare Information Assistant for a medical management platform.

Your role is to:
- Explain medical terminology in clear, simple language
- Answer general health questions with accurate, evidence-based information
- Help patients prepare questions for their doctors
- Summarize medical documents when provided
- Assist with appointment scheduling questions

IMPORTANT LIMITATIONS — you must always follow these rules:
1. You are NOT a doctor and cannot diagnose medical conditions
2. You cannot prescribe medications or recommend changing medication dosages
3. You cannot replace professional medical advice
4. Always encourage patients to consult their healthcare provider for personal medical decisions
5. Clearly state when something is general health information vs. personalized medical advice

EMERGENCY RULE: If a user describes symptoms that may indicate a medical emergency (chest pain, difficulty breathing, severe bleeding, signs of stroke, etc.), immediately direct them to call emergency services (911 in the US) or go to the nearest emergency room.

Always be empathetic, clear, and honest about the limits of what you can help with."""

EMERGENCY_KEYWORDS = [
    "chest pain", "can't breathe", "cannot breathe", "difficulty breathing",
    "stroke", "heart attack", "unconscious", "severe bleeding", "overdose",
    "suicidal", "suicide", "emergency", "call 911", "ambulance",
]

DIAGNOSIS_PATTERNS = [
    r"you have\s+\w+",
    r"you are suffering from",
    r"your diagnosis is",
    r"i diagnose",
    r"take\s+\d+\s*mg",
    r"increase.*dose",
    r"decrease.*dose",
]

DISCLAIMER = (
    "This information is for general educational purposes only and is not a substitute "
    "for professional medical advice. Always consult a qualified healthcare provider "
    "for personal medical guidance."
)


class HealthcareAIOrchestrator:
    def __init__(self):
        self._sessions: dict[str, list[dict]] = {}

    def _is_emergency(self, message: str) -> bool:
        lower = message.lower()
        return any(kw in lower for kw in EMERGENCY_KEYWORDS)

    def _validate_response(self, response_text: str) -> tuple[bool, str]:
        lower = response_text.lower()
        for pattern in DIAGNOSIS_PATTERNS:
            if re.search(pattern, lower):
                return False, (
                    "I'm not able to provide a diagnosis or specific medication advice. "
                    "Please consult your doctor for personalized medical guidance. "
                    "Is there something else I can help you with, like explaining a medical term "
                    "or preparing questions for your appointment?"
                )
        return True, response_text

    async def chat(self, message: str, patient_id: str, session_id: str | None = None) -> AIMessageResponse:
        if self._is_emergency(message):
            return AIMessageResponse(
                message=(
                    "⚠️ This sounds like it could be a medical emergency. "
                    "Please call emergency services (911) immediately or go to your nearest emergency room. "
                    "Do not wait — seek help right away."
                ),
                session_id=session_id or str(uuid.uuid4()),
                is_emergency_redirect=True,
                disclaimer=DISCLAIMER,
            )

        sid = session_id or str(uuid.uuid4())
        # Gemini history format: role is "user" or "model", content is in "parts"
        history = self._sessions.get(sid, [])

        model = get_gemini_model(HEALTHCARE_SYSTEM_PROMPT)
        # Build history excluding the current message for the chat session
        chat = model.start_chat(history=history)
        response = await chat.send_message_async(message)

        raw_text = response.text
        is_safe, final_text = self._validate_response(raw_text)

        # Store updated history (Gemini chat object tracks it)
        updated_history = [
            {"role": turn.role, "parts": [p.text for p in turn.parts]}
            for turn in chat.history
        ]
        # If response was replaced by safety filter, fix the last assistant entry
        if not is_safe and updated_history:
            updated_history[-1] = {"role": "model", "parts": [final_text]}

        self._sessions[sid] = updated_history[-20:]

        return AIMessageResponse(
            message=final_text,
            session_id=sid,
            disclaimer=DISCLAIMER if not is_safe else None,
            suggested_actions=(
                ["Schedule an appointment", "View your medical records"]
                if not is_safe else []
            ),
        )

    async def summarize_document(self, document_text: str, question: str | None = None) -> DocumentSummaryResponse:
        prompt = (
            f"Please summarize the following medical document in plain, easy-to-understand language. "
            f"Extract the key medical findings or information.\n\n"
            f"Document:\n---\n{document_text[:8000]}\n---"
        )
        if question:
            prompt += f"\n\nAlso answer this specific question about the document: {question}"

        model = get_gemini_model(HEALTHCARE_SYSTEM_PROMPT)
        response = await model.generate_content_async(prompt)

        summary = response.text
        key_points = [
            line.strip().lstrip("•-* ")
            for line in summary.split("\n")
            if line.strip().startswith(("•", "-", "*", "1.", "2.", "3."))
        ][:5]

        return DocumentSummaryResponse(
            summary=summary,
            key_points=key_points,
            disclaimer=DISCLAIMER,
        )
