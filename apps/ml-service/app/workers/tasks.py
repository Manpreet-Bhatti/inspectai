"""Background task definitions for async processing.

These tasks can be run via FastAPI BackgroundTasks or integrated
with a task queue like Celery for production workloads.
"""

import logging

from typing import Any
from app.services.image_analyzer import get_image_analyzer_service
from app.services.supabase_client import get_supabase_client
from app.services.speech_recognizer import get_speech_recognizer_service
from app.services.text_processor import get_text_processor_service

logger = logging.getLogger(__name__)


async def process_photo_task(
    photo_id: str,
    storage_path: str,
    inspection_id: str,
) -> dict[str, Any]:
    """Process a photo through the ML pipeline.

    This task:
    1. Downloads the photo from Supabase Storage
    2. Runs image captioning, object detection, and condition classification
    3. Updates the database with results
    4. Creates any suggested findings
    5. Optionally sends a callback

    Args:
        photo_id: UUID of the photo record
        storage_path: Path in Supabase Storage
        inspection_id: UUID of the inspection
        callback_url: Optional URL to POST results to

    Returns:
        Dictionary with task results
    """

    logger.info("Starting photo processing task for %s", photo_id)

    supabase = get_supabase_client()
    analyzer = get_image_analyzer_service()

    try:
        image_bytes = await supabase.download_file("inspection-photos", storage_path)
        logger.debug("Downloaded %d bytes for photo %s",
                     len(image_bytes), photo_id)

        analysis = await analyzer.analyze_image(image_bytes)

        await supabase.update_photo_analysis(
            photo_id,
            {
                "caption": analysis.caption,
                "objects": [obj.model_dump() for obj in analysis.objects],
                "condition": analysis.condition,
                "condition_confidence": analysis.condition_confidence,
            },
        )

        # Create findings
        findings_created = []
        for finding in analysis.suggested_findings:
            result = await supabase.create_finding(
                {
                    "inspection_id": inspection_id,
                    "photo_id": photo_id,
                    "title": finding.title,
                    "description": finding.description,
                    "category": finding.category,
                    "severity": finding.severity,
                    "confidence": finding.confidence,
                }
            )
            findings_created.append(result.get("id"))

        logger.info(
            f"Completed photo task {photo_id}: "
            f"{len(analysis.objects)} objects, "
            f"{len(findings_created)} findings"
        )

        return {
            "photo_id": photo_id,
            "status": "completed",
            "caption": analysis.caption,
            "condition": analysis.condition,
            "objects_count": len(analysis.objects),
            "findings_created": findings_created,
        }

    except Exception as e:
        logger.error("Photo task failed for %s: %s", photo_id, e)
        await supabase.update_photo_error(photo_id, str(e))
        return {
            "photo_id": photo_id,
            "status": "failed",
            "error": str(e),
        }


async def process_voice_note_task(
    voice_note_id: str,
    storage_path: str,
    inspection_id: str,
) -> dict[str, Any]:
    """Process a voice note through the ML pipeline.

    This task:
    1. Downloads the audio from Supabase Storage
    2. Transcribes using Whisper
    3. Generates a summary if transcript is long
    4. Updates the database with results
    5. Optionally sends a callback

    Args:
        voice_note_id: UUID of the voice note record
        storage_path: Path in Supabase Storage
        inspection_id: UUID of the inspection
        callback_url: Optional URL to POST results to

    Returns:
        Dictionary with task results
    """
    logger.info("Starting voice note processing task for %s", voice_note_id)

    supabase = get_supabase_client()
    recognizer = get_speech_recognizer_service()
    text_processor = get_text_processor_service()

    try:
        # Download audio
        audio_bytes = await supabase.download_file("voice-notes", storage_path)
        logger.debug("Downloaded %d bytes for voice note %s",
                     len(audio_bytes), voice_note_id)

        # Transcribe
        result = await recognizer.transcribe(
            audio_bytes, voice_note_id, inspection_id
        )

        if result.error:
            await supabase.update_voice_note_error(voice_note_id, result.error)
            return {
                "voice_note_id": voice_note_id,
                "status": "failed",
                "error": result.error,
            }

        # Generate summary if long enough
        summary = None
        if result.transcript and len(result.transcript) > 100:
            summary = await text_processor.summarize(result.transcript)

        # Update database
        await supabase.update_voice_note(voice_note_id, result.transcript, summary)

        logger.info(
            f"Completed voice note task {voice_note_id}: "
            f"{len(result.transcript)} chars, "
            f"{result.duration:.1f}s"
        )

        return {
            "voice_note_id": voice_note_id,
            "status": "completed",
            "transcript_length": len(result.transcript),
            "duration": result.duration,
            "has_summary": summary is not None,
        }

    except Exception as e:
        logger.error(f"Voice note task failed for {voice_note_id}: {e}")
        await supabase.update_voice_note_error(voice_note_id, str(e))
        return {
            "voice_note_id": voice_note_id,
            "status": "failed",
            "error": str(e),
        }


async def generate_embeddings_task(
    finding_id: str,
    text: str,
) -> dict[str, Any]:
    """Generate and store embeddings for a finding.

    This task:
    1. Generates embedding vector for the finding text
    2. Updates the database with the embedding

    Args:
        finding_id: UUID of the finding record
        text: Text to generate embedding for (title + description)

    Returns:
        Dictionary with task results
    """
    from app.services.embedding_service import get_embedding_service
    from app.services.supabase_client import get_supabase_client

    logger.info(f"Starting embedding generation task for finding {finding_id}")

    embedding_service = get_embedding_service()
    supabase = get_supabase_client()

    try:
        # Generate embedding
        embedding = await embedding_service.generate_embedding(text)

        # Store in database
        await supabase.update_finding_embedding(finding_id, embedding)

        logger.info(
            f"Completed embedding task {finding_id}: "
            f"{len(embedding)} dimensions"
        )

        return {
            "finding_id": finding_id,
            "status": "completed",
            "dimensions": len(embedding),
        }

    except Exception as e:
        logger.error(f"Embedding task failed for {finding_id}: {e}")
        return {
            "finding_id": finding_id,
            "status": "failed",
            "error": str(e),
        }


async def batch_process_photos(
    photos: list[dict[str, str]],
) -> list[dict[str, Any]]:
    """Process multiple photos in batch.

    Args:
        photos: List of dicts with photo_id, storage_path, inspection_id

    Returns:
        List of task results
    """
    results = []
    for photo in photos:
        result = await process_photo_task(
            photo["photo_id"],
            photo["storage_path"],
            photo["inspection_id"],
        )
        results.append(result)
    return results


async def batch_generate_embeddings(
    findings: list[dict[str, str]],
) -> list[dict[str, Any]]:
    """Generate embeddings for multiple findings in batch.

    Args:
        findings: List of dicts with finding_id and text

    Returns:
        List of task results
    """
    results = []
    for finding in findings:
        result = await generate_embeddings_task(
            finding["finding_id"],
            finding["text"],
        )
        results.append(result)
    return results
