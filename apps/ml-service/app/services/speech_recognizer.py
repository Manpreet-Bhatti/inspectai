"""Speech recognition service using HuggingFace Inference Providers."""

import asyncio
import logging
from functools import lru_cache

from app.config import MODELS
from app.models.schemas import TranscriptionResult
import app.services.hf_inference as hf_inference

logger = logging.getLogger(__name__)


class SpeechRecognizerService:
    """Service for transcribing audio via HF Inference Providers (Whisper)."""

    async def transcribe(
        self, audio_bytes: bytes, voice_note_id: str, inspection_id: str
    ) -> TranscriptionResult:
        """Transcribe audio bytes to text."""
        try:
            model_id = MODELS["speech_recognition"]["model_id"]
            transcript = await asyncio.to_thread(
                hf_inference.transcribe_audio, audio_bytes, model_id
            )
            transcript = transcript.strip()

            logger.info(
                "Transcribed voice note %s: %d chars",
                voice_note_id,
                len(transcript),
            )

            return TranscriptionResult(
                voice_note_id=voice_note_id,
                inspection_id=inspection_id,
                transcript=transcript,
            )

        except Exception as e:
            logger.error("Transcription failed for %s: %s", voice_note_id, e)
            return TranscriptionResult(
                voice_note_id=voice_note_id,
                inspection_id=inspection_id,
                transcript="",
                error=str(e),
            )


@lru_cache(maxsize=1)
def get_speech_recognizer_service() -> SpeechRecognizerService:
    return SpeechRecognizerService()
