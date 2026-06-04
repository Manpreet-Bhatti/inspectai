"""Cost estimation service for repair costs."""

import logging

from typing import Any
from app.config import COST_ESTIMATES
from app.models.schemas import CostEstimateResponse, FindingCategory, Severity

logger = logging.getLogger(__name__)


class CostEstimatorService:
    """Service for estimating repair costs based on category and severity."""

    def __init__(self):
        self.cost_data = COST_ESTIMATES

    async def estimate_cost(
        self,
        category: FindingCategory,
        severity: Severity,
        description: str | None = None,
    ) -> CostEstimateResponse:
        """Estimate repair cost for a finding."""

        cost_range = self._get_cost_range(category, severity)
        min_cost, max_cost = cost_range

        estimate = (min_cost + max_cost) / 2

        if description:
            adjustment = self._analyze_description(description)
            estimate *= adjustment
            estimate = max(min_cost, min(max_cost, estimate))

        confidence = self._calculate_confidence(category, description)

        logger.debug(
            "Cost estimate for %s/%s: $%.2f ($%d-$%d)",
            category, severity, estimate, min_cost, max_cost
        )

        return CostEstimateResponse(
            estimate=round(estimate, 2),
            min_cost=round(min_cost, 2),
            max_cost=round(max_cost, 2),
            category=category,
            severity=severity,
            confidence=confidence,
        )

    def _get_cost_range(
        self, category: FindingCategory, severity: Severity
    ) -> tuple[float, float]:
        """Get the cost range for a category and severity."""

        category_costs = self.cost_data.get(
            category, self.cost_data["cosmetic"])

        if severity == "info":
            return (0, 100)

        return category_costs.get(severity, category_costs["cosmetic"])

    def _analyze_description(self, description: str) -> float:
        """Analyze description to adjust cost estimate."""
        description_lower = description.lower()

        # Keywords that increase cost
        high_cost_keywords = [
            "replace",
            "extensive",
            "major",
            "complete",
            "emergency",
            "hazard",
            "structural",
            "foundation",
        ]

        # Keywords that decrease cost
        low_cost_keywords = [
            "minor",
            "small",
            "touch up",
            "cosmetic",
            "surface",
            "simple",
            "easy",
        ]

        adjustment = 1.0

        for keyword in high_cost_keywords:
            if keyword in description_lower:
                adjustment += 0.1

        for keyword in low_cost_keywords:
            if keyword in description_lower:
                adjustment -= 0.1

        return max(0.5, min(1.5, adjustment))

    def _calculate_confidence(
        self,
        category: FindingCategory,
        description: str | None,
    ) -> float:
        """Calculate confidence in the estimate."""
        base_confidence = 0.6

        # Higher confidence for common categories
        if category in ["cosmetic", "interior", "exterior"]:
            base_confidence += 0.1

        # Lower confidence for complex categories
        if category in ["structural", "electrical", "hvac"]:
            base_confidence -= 0.1

        if description and len(description) > 50:
            base_confidence += 0.1

        return min(0.9, max(0.4, base_confidence))

    async def estimate_total_cost(
        self, findings: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """Estimate total cost for multiple findings."""
        total_estimate = 0.0
        total_min = 0.0
        total_max = 0.0

        for finding in findings:
            estimate = await self.estimate_cost(
                category=finding.get("category", "cosmetic"),
                severity=finding.get("severity", "minor"),
                description=finding.get("description"),
            )
            total_estimate += estimate.estimate
            total_min += estimate.min_cost
            total_max += estimate.max_cost

        return {
            "total_estimate": round(total_estimate, 2),
            "total_min": round(total_min, 2),
            "total_max": round(total_max, 2),
            "finding_count": len(findings),
        }


_service: CostEstimatorService | None = None


def get_cost_estimator_service() -> CostEstimatorService:
    """Get the cost estimator service instance."""

    if _service is None:
        _service = CostEstimatorService()
    return _service
