import whisper
import noisereduce as nr
import numpy as np
import soundfile as sf
import io
import tempfile
import os
from app.config import settings
import structlog

logger = structlog.get_logger()

_model = None


def get_whisper_model():
    global _model
    if _model is None:
        _model = whisper.load_model(settings.whisper_model)
    return _model


async def transcribe_audio(audio_bytes: bytes, language: str = None) -> dict:
    """Transcribe audio bytes using Whisper with noise reduction."""
    try:
        # Write to temp file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        try:
            # Load and reduce noise
            audio_data, sample_rate = sf.read(tmp_path)
            if len(audio_data.shape) > 1:
                audio_data = audio_data[:, 0]  # mono

            reduced = nr.reduce_noise(y=audio_data, sr=sample_rate)

            # Save cleaned audio
            cleaned_path = tmp_path.replace(".wav", "_clean.wav")
            sf.write(cleaned_path, reduced, sample_rate)

            # Transcribe
            model = get_whisper_model()
            options = {"task": "transcribe"}
            if language and language != "en":
                lang_map = {"ha": "hausa", "yo": "yoruba", "ig": "igbo", "pcm": "english"}
                options["language"] = lang_map.get(language, language)

            result = model.transcribe(cleaned_path, **options)

            return {
                "transcript": result["text"].strip(),
                "detected_language": result.get("language", language or "en"),
                "confidence": 0.9,  # Whisper doesn't give per-segment confidence easily
            }
        finally:
            os.unlink(tmp_path)
            if os.path.exists(cleaned_path):
                os.unlink(cleaned_path)

    except Exception as e:
        logger.error("Transcription failed", error=str(e))
        raise ValueError(f"Transcription failed: {str(e)}")
