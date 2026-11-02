import google.generativeai as genai
from app.core.config import settings

_configured = False


def configure_gemini() -> None:
    global _configured
    if not _configured:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _configured = True


def get_gemini_model(system_instruction: str) -> genai.GenerativeModel:
    configure_gemini()
    return genai.GenerativeModel(
        model_name=settings.AI_MODEL,
        system_instruction=system_instruction,
        generation_config=genai.types.GenerationConfig(
            max_output_tokens=settings.AI_MAX_TOKENS,
        ),
    )
