from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.whisper_service import transcribe_audio
from app.services.nlp_service import extract_transaction, extract_debt
import structlog

router = APIRouter()
logger = structlog.get_logger()


@router.post("/process")
async def process_voice(
    audio: UploadFile = File(...),
    language: str = Form(default="en"),
):
    """Transcribe audio and extract transaction entities."""
    audio_bytes = await audio.read()
    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty audio file")

    try:
        transcription = await transcribe_audio(audio_bytes, language)
        transcript = transcription["transcript"]

        # Determine if it's a debt or a transaction
        debt_keywords = ["owes", "credit", "will pay", "owe", "next week", "next friday",
                         "collected", "took goods", "na bashi", "ya karbi"]
        is_debt = any(kw in transcript.lower() for kw in debt_keywords)

        if is_debt:
            extraction = await extract_debt(transcript, language)
            return {"type": "debt", "data": extraction.model_dump(), "transcript": transcript}
        else:
            extraction = await extract_transaction(transcript, language)
            return {"type": "transaction", "data": extraction.model_dump(), "transcript": transcript}

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.post("/transcribe")
async def transcribe_only(
    audio: UploadFile = File(...),
    language: str = Form(default="en"),
):
    """Transcribe audio only without extraction."""
    audio_bytes = await audio.read()
    result = await transcribe_audio(audio_bytes, language)
    return result
