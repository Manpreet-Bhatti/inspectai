"""Speech recognition service using Whisper."""

import logging
import tempfile
from pathlib import Path
from functools import lru_cache
import whisper
import soundfile as sf
from app.config import MODELS
from app.models.schemas import TranscriptionResult
from pydub import AudioSegment

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def _get_whisper_model():
    """Lazy load the Whisper model."""

    try:
        model_config = MODELS["speech_recognition"]
        model_size = model_config["model_id"].rsplit("-", maxsplit=1)[-1]
        whisper_model = whisper.load_model(model_size)
        logger.info("Loaded Whisper model: %s", model_size)
        return whisper_model
    except Exception as e:
        logger.error("Failed to load Whisper model: %s", e)
        raise e


class SpeechRecognizerService:
    """Service for transcribing audio using Whisper."""

    async def transcribe(
        self, audio_bytes: bytes, voice_note_id: str, inspection_id: str
    ) -> TranscriptionResult:
        """Transcribe audio bytes to text."""
        try:
            with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
                f.write(audio_bytes)
                temp_path = Path(f.name)

            try:
                model = _get_whisper_model()
                result = model.transcribe(str(temp_path))

                transcript = result["text"].strip()
                language = result.get("language", "en")

                duration = self._get_audio_duration(temp_path)

                logger.info(
                    "Transcribed voice note %s: %d chars, %.1fs",
                    voice_note_id,
                    len(transcript),
                    duration,
                )

                return TranscriptionResult(
                    voice_note_id=voice_note_id,
                    inspection_id=inspection_id,
                    transcript=transcript,
                    duration=duration,
                    language=language,
                )
            finally:
                # Clean up temp file
                temp_path.unlink(missing_ok=True)

        except (OSError, RuntimeError, KeyError) as e:
            logger.error("Transcription failed for %s: %s", voice_note_id, e)
            return TranscriptionResult(
                voice_note_id=voice_note_id,
                inspection_id=inspection_id,
                transcript="",
                error=str(e),
            )

    def _get_audio_duration(self, audio_path: Path) -> float:
        """Get the duration of an audio file in seconds."""
        try:
            info = sf.info(str(audio_path))
            return info.duration
        except (RuntimeError, OSError):
            try:
                audio = AudioSegment.from_file(str(audio_path))
                return len(audio) / 1000.0
            except (OSError, IOError) as e:
                logger.warning(
                    "Could not determine audio duration: %s", e)
                return 0.0


@lru_cache(maxsize=1)
def get_speech_recognizer_service() -> SpeechRecognizerService:
    """Get the speech recognizer service instance."""

    return SpeechRecognizerService()
