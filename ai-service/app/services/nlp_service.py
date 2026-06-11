import json
import re
from openai import AsyncOpenAI
from app.config import settings
from app.prompts.prompts import TRANSACTION_EXTRACTION_PROMPT, DEBT_EXTRACTION_PROMPT
from app.models.entity_models import TransactionExtraction, DebtExtraction
import structlog
from datetime import datetime

logger = structlog.get_logger()
client = AsyncOpenAI(api_key=settings.openai_api_key)


def normalize_currency(text: str) -> str:
    text = re.sub(r'(\d+)\s*k\b', lambda m: str(int(m.group(1)) * 1000), text, flags=re.IGNORECASE)
    text = re.sub(r'(\d+)\s*million', lambda m: str(int(m.group(1)) * 1_000_000), text, flags=re.IGNORECASE)
    text = re.sub(r'half\s+million', '500000', text, flags=re.IGNORECASE)
    text = re.sub(r'quarter\s+million', '250000', text, flags=re.IGNORECASE)
    return text


async def extract_transaction(transcript: str, language: str) -> TransactionExtraction:
    normalized = normalize_currency(transcript)
    prompt = TRANSACTION_EXTRACTION_PROMPT.format(transcript=normalized, language=language)

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.1,
    )

    raw = json.loads(response.choices[0].message.content)
    return TransactionExtraction(**raw, transcript=transcript, language=language)


async def extract_debt(transcript: str, language: str) -> DebtExtraction:
    normalized = normalize_currency(transcript)
    prompt = DEBT_EXTRACTION_PROMPT.format(
        transcript=normalized,
        language=language,
        current_date=datetime.now().strftime("%Y-%m-%d"),
    )

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.1,
    )

    raw = json.loads(response.choices[0].message.content)
    return DebtExtraction(**raw)
