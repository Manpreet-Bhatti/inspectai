"""Cost estimation API router."""

import logging
from typing import Any
from fastapi import APIRouter, HTTPException
from app.models.schemas import CostEstimateRequest, CostEstimateResponse
from app.services.cost_estimator import get_cost_estimator_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/costs", tags=["costs"])


@router.post("/estimate", response_model=CostEstimateResponse)
async def estimate_cost(request: CostEstimateRequest) -> CostEstimateResponse:
    """Estimate repair cost for a single finding.

    The estimate is based on the category, severity, and optional
    description which can refine the estimate.
    """
    logger.info("Estimating cost for %s/%s",
                request.category, request.severity)

    cost_service = get_cost_estimator_service()

    try:
        estimate = await cost_service.estimate_cost(
            category=request.category,
            severity=request.severity,
            description=request.description,
        )
        return estimate

    except Exception as e:
        logger.error("Cost estimation failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/estimate/batch")
async def estimate_costs_batch(
    findings: list[CostEstimateRequest],
) -> list[CostEstimateResponse]:
    """Estimate repair costs for multiple findings."""
    if not findings:
        return []

    if len(findings) > 100:
        raise HTTPException(
            status_code=400,
            detail="Maximum 100 findings per batch",
        )

    logger.info("Estimating costs for %d findings", len(findings))

    cost_service = get_cost_estimator_service()
    results = []

    for finding in findings:
        try:
            estimate = await cost_service.estimate_cost(
                category=finding.category,
                severity=finding.severity,
                description=finding.description,
            )
            results.append(estimate)
        except Exception as e:  # pylint: disable=broad-exception-caught
            logger.error("Cost estimation failed for finding: %s", e)
            # Return a zero estimate on error
            results.append(
                CostEstimateResponse(
                    estimate=0,
                    min_cost=0,
                    max_cost=0,
                    category=finding.category,
                    severity=finding.severity,
                    confidence=0,
                )
            )

    return results


@router.post("/total")
async def estimate_total_cost(findings: list[dict[str, Any]]) -> dict[str, Any]:
    """Estimate total repair cost for all findings.

    Each finding should have 'category', 'severity', and optionally
    'description' fields.
    """
    if not findings:
        return {
            "total_estimate": 0,
            "total_min": 0,
            "total_max": 0,
            "finding_count": 0,
        }

    logger.info("Calculating total cost for %d findings", len(findings))

    cost_service = get_cost_estimator_service()

    try:
        total = await cost_service.estimate_total_cost(findings)
        return total

    except Exception as e:
        logger.error("Total cost estimation failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e
