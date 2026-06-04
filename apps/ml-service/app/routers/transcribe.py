"""Audio transcription API router."""

import logging
import httpx

from fastapi import APIRouter, BackgroundTasks, HTTPException
from app.models.schemas import (
    TranscribeRequest,
    TranscribeResponse,
    TranscriptionResult,
)
from app.services.rate_limiter import check_inference_rate_limit
from app.services.speech_recognizer import get_speech_recognizer_service
from app.services.supabase_client import get_supabase_client
from app.services.text_processor import get_text_processor_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/transcribe", tags=["transcribe"])


@router.post("", response_model=TranscribeResponse)
async def transcribe_audio(
    request: TranscribeRequest,
    background_tasks: BackgroundTasks,
) -> TranscribeResponse:
    """Queue audio for transcription.

    This endpoint accepts a voice note ID and storage path, then queues
    the audio for background transcription. Results are written directly
    to the database, triggering Supabase Realtime updates.
    """
    logger.info("Queuing voice note %s for transcription",
                request.voice_note_id)

    await check_inference_rate_limit(request.user_id)

    background_tasks.add_task(
        process_transcription,
        request.voice_note_id,
        request.storage_path,
        request.inspection_id,
        request.callback_url,
    )

    return TranscribeResponse(
        status="queued",
        voice_note_id=request.voice_note_id,
        message="Audio queued for transcription",
    )


@router.post("/sync", response_model=TranscriptionResult)
async def transcribe_audio_sync(
    request: TranscribeRequest,
) -> TranscriptionResult:
    """Transcribe audio synchronously (for testing/debugging).

    Warning: This can be slow for long audio files.
    """
    logger.info("Transcribing voice note %s synchronously",
                request.voice_note_id)

    await check_inference_rate_limit(request.user_id)

    try:
        supabase = get_supabase_client()
        recognizer = get_speech_recognizer_service()
        text_processor = get_text_processor_service()

        # Download audio
        audio_bytes = await supabase.download_file(
            "voice-notes", request.storage_path
        )

        # Transcribe
        result = await recognizer.transcribe(
            audio_bytes,
            request.voice_note_id,
            request.inspection_id,
        )

        # Generate summary if transcript is long enough
        if result.transcript and len(result.transcript) > 100:
            result.summary = await text_processor.summarize(result.transcript)

        # Update database
        await supabase.update_voice_note(
            request.voice_note_id,
            result.transcript,
            result.summary,
        )

        return result

    except Exception as e:
        logger.error("Sync transcription failed for %s: %s",
                     request.voice_note_id, e)
        raise HTTPException(status_code=500, detail=str(e)) from e


async def process_transcription(
    voice_note_id: str,
    storage_path: str,
    inspection_id: str,
    callback_url: str | None = None,
) -> None:
    """Background task to process audio transcription."""
    logger.info("Processing transcription for %s", voice_note_id)

    supabase = get_supabase_client()
    recognizer = get_speech_recognizer_service()
    text_processor = get_text_processor_service()

    try:
        # Download audio from Supabase Storage
        audio_bytes = await supabase.download_file("voice-notes", storage_path)

        # Transcribe
        result = await recognizer.transcribe(
            audio_bytes,
            voice_note_id,
            inspection_id,
        )

        if result.error:
            await supabase.update_voice_note_error(voice_note_id, result.error)
            return

        # Generate summary if transcript is long enough
        summary = None
        if result.transcript and len(result.transcript) > 100:
            summary = await text_processor.summarize(result.transcript)
            result.summary = summary

        # Update database (triggers realtime subscription)
        await supabase.update_voice_note(
            voice_note_id,
            result.transcript,
            summary,
        )

        logger.info("Completed transcription for voice note %s", voice_note_id)

        # Optional callback
        if callback_url:
            await _send_callback(callback_url, result)

    except Exception as e:
        logger.error("Transcription failed for %s: %s", voice_note_id, e)
        await supabase.update_voice_note_error(voice_note_id, str(e))


async def _send_callback(url: str, result: TranscriptionResult) -> None:
    """Send callback with transcription results."""

    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                url,
                json=result.model_dump(),
                timeout=10.0,
            )
        logger.info("Sent callback for voice note %s", result.voice_note_id)
    except Exception as e:
        logger.error("Failed to send callback: %s", e)
