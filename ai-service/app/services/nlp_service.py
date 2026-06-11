import json
import re
import google.generativeai as genai
from app.config import settings
from app.prompts.prompts import TRANSACTION_EXTRACTION_PROMPT, DEBT_EXTRACTION_PROMPT
from app.models.entity_models import TransactionExtraction, DebtExtraction
import structlog
from datetime import datetime

logger = structlog.get_logger()

genai.configure(api_key=settings.gemini_api_key)


def _get_model(pro: bool = False) -> genai.GenerativeModel:
    model_name = settings.gemini_pro_model if pro else settings.gemini_model
    return genai.GenerativeModel(
        model_name=model_name,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.1,
        ),
    )


def normalize_currency(text: str) -> str:
    text = re.sub(r'(\d+)\s*k\b', lambda m: str(int(m.group(1)) * 1000), text, flags=re.IGNORECASE)
    text = re.sub(r'(\d+)\s*million', lambda m: str(int(m.group(1)) * 1_000_000), text, flags=re.IGNORECASE)
    text = re.sub(r'half\s+million', '500000', text, flags=re.IGNORECASE)
    text = re.sub(r'quarter\s+million', '250000', text, flags=re.IGNORECASE)
    return text


async def extract_transaction(transcript: str, language: str) -> TransactionExtraction:
    normalized = normalize_currency(transcript)
    prompt = TRANSACTION_EXTRACTION_PROMPT.format(transcript=normalized, language=language)

    model = _get_model()
    response = model.generate_content(prompt)

    raw = json.loads(response.text)
    return TransactionExtraction(**raw, transcript=transcript, language=language)


async def extract_debt(transcript: str, language: str) -> DebtExtraction:
    normalized = normalize_currency(transcript)
    prompt = DEBT_EXTRACTION_PROMPT.format(
        transcript=normalized,
        language=language,
        current_date=datetime.now().strftime("%Y-%m-%d"),
    )

    model = _get_model()
    response = model.generate_content(prompt)

    raw = json.loads(response.text)
    return DebtExtraction(**raw)
