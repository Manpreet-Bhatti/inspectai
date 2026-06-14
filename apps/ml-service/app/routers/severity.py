"""Severity classification API router."""

import logging
from fastapi import APIRouter, HTTPException

from app.models.schemas import SeverityClassifyRequest, SeverityClassifyResponse
from app.services.severity_classifier import get_severity_classifier

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/classify", tags=["classify"])


@router.post("/severity", response_model=SeverityClassifyResponse)
async def classify_severity(
    request: SeverityClassifyRequest,
) -> SeverityClassifyResponse:
    """Classify the severity of a finding using zero-shot NLP.

    Accepts finding text (title + description) and optional image condition
    signal from a prior photo analysis. Returns the predicted severity level
    and a confidence score.
    """
    if not request.title.strip() and not request.description.strip():
        raise HTTPException(
            status_code=422, detail="title or description must not be empty"
        )

    classifier = get_severity_classifier()

    severity, confidence = await classifier.classify(
        title=request.title,
        description=request.description,
        category=request.category,
        image_condition=request.image_condition,
        image_confidence=request.image_confidence,
    )

    method = "zero-shot-text"
    if request.image_condition and request.image_confidence is not None:
        method = "zero-shot-text+image-fusion"

    logger.info(
        "Classified severity: %s (%.3f) via %s for category=%s",
        severity,
        confidence,
        method,
        request.category,
    )

    return SeverityClassifyResponse(
        severity=severity,
        confidence=confidence,
        method=method,
    )
