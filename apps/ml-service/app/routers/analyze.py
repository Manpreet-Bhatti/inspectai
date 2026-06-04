"""Photo analysis API router."""

import asyncio
import logging
import httpx
from fastapi import APIRouter, BackgroundTasks, HTTPException
from app.models.schemas import (
    AnalyzePhotoRequest,
    AnalyzePhotoResponse,
    ImageAnalysis,
    PhotoAnalysisResult,
)
from app.services.image_analyzer import get_image_analyzer_service
from app.services.rate_limiter import check_inference_rate_limit
from app.services.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analyze", tags=["analyze"])


@router.post("/image", response_model=AnalyzePhotoResponse)
async def analyze_photo(
    request: AnalyzePhotoRequest,
    background_tasks: BackgroundTasks,
) -> AnalyzePhotoResponse:
    """Queue a photo for AI analysis.

    This endpoint accepts a photo ID and storage path, then queues the
    photo for background processing. Results are written directly to
    the database, triggering Supabase Realtime updates.
    """
    logger.info("Queuing photo %s for analysis", request.photo_id)

    await check_inference_rate_limit(request.user_id)

    background_tasks.add_task(
        process_photo_analysis,
        request.photo_id,
        request.storage_path,
        request.inspection_id,
        request.callback_url,
    )

    return AnalyzePhotoResponse(
        status="queued",
        photo_id=request.photo_id,
        message="Photo queued for analysis",
    )


@router.post("/image/sync", response_model=ImageAnalysis)
async def analyze_photo_sync(
    request: AnalyzePhotoRequest,
) -> ImageAnalysis:
    """Analyze a photo synchronously (for testing/debugging).

    Warning: This can be slow for large images.
    """
    logger.info("Analyzing photo %s synchronously", request.photo_id)

    await check_inference_rate_limit(request.user_id)

    try:
        supabase = get_supabase_client()
        analyzer = get_image_analyzer_service()

        # Download image
        image_bytes = await supabase.download_file(
            "inspection-photos", request.storage_path
        )

        # Analyze
        analysis = await analyzer.analyze_image(image_bytes)

        # Update database
        await supabase.update_photo_analysis(
            request.photo_id,
            {
                "caption": analysis.caption,
                "objects": [obj.model_dump() for obj in analysis.objects],
                "condition": analysis.condition,
                "condition_confidence": analysis.condition_confidence,
            },
        )

        # Create findings
        for finding in analysis.suggested_findings:
            await supabase.create_finding(
                {
                    "inspection_id": request.inspection_id,
                    "photo_id": request.photo_id,
                    "title": finding.title,
                    "description": finding.description,
                    "category": finding.category,
                    "severity": finding.severity,
                    "confidence": finding.confidence,
                }
            )

        return analysis

    except Exception as e:
        logger.error("Sync analysis failed for %s: %s", request.photo_id, e)
        raise HTTPException(status_code=500, detail=str(e)) from e


async def process_photo_analysis(
    photo_id: str,
    storage_path: str,
    inspection_id: str,
    callback_url: str | None = None,
) -> None:
    """Background task to process photo analysis."""
    logger.info("Processing photo analysis for %s", photo_id)

    supabase = get_supabase_client()
    analyzer = get_image_analyzer_service()

    try:
        # Download image from Supabase Storage
        image_bytes = await supabase.download_file("inspection-photos", storage_path)

        # Run ML pipeline
        analysis = await analyzer.analyze_image(image_bytes)

        # Update database (triggers realtime subscription)
        await supabase.update_photo_analysis(
            photo_id,
            {
                "caption": analysis.caption,
                "objects": [obj.model_dump() for obj in analysis.objects],
                "condition": analysis.condition,
                "condition_confidence": analysis.condition_confidence,
            },
        )

        # Create findings if issues detected
        for finding in analysis.suggested_findings:
            await supabase.create_finding(
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

        logger.info("Completed analysis for photo %s", photo_id)

        if callback_url:
            await _send_callback(
                callback_url,
                PhotoAnalysisResult(
                    photo_id=photo_id,
                    inspection_id=inspection_id,
                    analysis=analysis,
                ),
            )

    except Exception as e:
        logger.error("Photo analysis failed for %s: %s", photo_id, e)
        await supabase.update_photo_error(photo_id, str(e))


async def _send_callback(url: str, result: PhotoAnalysisResult) -> None:
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=result.model_dump(), timeout=10.0)
            resp.raise_for_status()
        logger.info("Sent callback for photo %s", result.photo_id)

    except asyncio.CancelledError:
        raise

    except (httpx.TimeoutException, httpx.RequestError, httpx.HTTPStatusError) as e:
        logger.warning(
            "Failed to send callback for photo %s: %s", result.photo_id, e)
