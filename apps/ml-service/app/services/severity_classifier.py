"""Severity classification service for property inspection findings."""

import asyncio
import logging
from functools import lru_cache

from app.config import MODELS
import app.services.hf_inference as hf_inference

logger = logging.getLogger(__name__)

# Ordered from least to most severe (index = numeric rank)
SEVERITY_ORDER: list[str] = ["info", "cosmetic", "minor", "major", "critical"]

# Categories that escalate severity by 1 rank when confidence is high
_HIGH_RISK_CATEGORIES = {"safety", "structural", "electrical"}
# Categories that cap severity at "minor" (no critical/major for paint scratches)
_LOW_RISK_CATEGORIES = {"cosmetic"}

# image condition label → baseline severity rank
_CONDITION_TO_RANK: dict[str, int] = {
    "good condition": 0,   # info
    "fair condition": 1,   # cosmetic
    "poor condition": 2,   # minor
    "damaged": 3,          # major
}


def _rank(severity: str) -> int:
    try:
        return SEVERITY_ORDER.index(severity)
    except ValueError:
        return 2  # default to minor


def _from_rank(rank: int) -> str:
    return SEVERITY_ORDER[max(0, min(rank, len(SEVERITY_ORDER) - 1))]


class SeverityClassifierService:
    """Classify finding severity using zero-shot NLP + optional image signal fusion."""

    async def classify(
        self,
        title: str,
        description: str,
        category: str,
        image_condition: str | None = None,
        image_confidence: float | None = None,
    ) -> tuple[str, float]:
        """Return (severity, confidence) for a finding.

        Fuses zero-shot text classification (weight 0.7) with image condition
        signal (weight 0.3) when available, then applies category-based risk
        adjustment.
        """
        text_severity, text_conf = await self._classify_text(title, description)
        text_rank = _rank(text_severity)

        if image_condition and image_confidence is not None and image_confidence > 0.4:
            img_rank = _CONDITION_TO_RANK.get(image_condition, 2)
            fused_rank = round(text_rank * 0.7 + img_rank * 0.3)
            fused_conf = text_conf * 0.7 + image_confidence * 0.3
        else:
            fused_rank = text_rank
            fused_conf = text_conf

        adjusted_rank = self._apply_category_risk(fused_rank, category, fused_conf)
        return _from_rank(adjusted_rank), round(fused_conf, 3)

    async def _classify_text(self, title: str, description: str) -> tuple[str, float]:
        """Zero-shot classify finding text → (severity, confidence)."""
        model_config = MODELS["severity_classifier"]
        model_id = model_config["model_id"]
        hypotheses: dict[str, str] = model_config["severity_hypotheses"]

        text = f"{title}. {description}".strip()
        labels = list(hypotheses.values())
        severity_keys = list(hypotheses.keys())

        try:
            results = await asyncio.to_thread(
                hf_inference.classify_text_zero_shot, text, model_id, labels
            )
            # Map hypothesis back to severity key via index position
            label_to_severity = {v: k for k, v in hypotheses.items()}
            top = results[0]
            severity = label_to_severity.get(top["label"], "minor")
            confidence = float(top["score"])
            logger.debug("Text severity: %s (%.3f)", severity, confidence)
            return severity, confidence
        except Exception as e:
            logger.error("Zero-shot severity classification failed: %s", e)
            return self._keyword_fallback(title, description), 0.5

    def _apply_category_risk(self, rank: int, category: str, confidence: float) -> int:
        """Escalate or cap severity rank based on finding category."""
        if category in _HIGH_RISK_CATEGORIES and confidence > 0.65:
            rank = min(rank + 1, len(SEVERITY_ORDER) - 1)
        elif category in _LOW_RISK_CATEGORIES:
            rank = min(rank, _rank("minor"))
        return rank

    def _keyword_fallback(self, title: str, description: str) -> str:
        """Simple keyword heuristic when HF inference is unavailable."""
        text = f"{title} {description}".lower()
        if any(w in text for w in ("collapse", "failure", "hazard", "fire", "flood", "gas leak", "asbestos", "mold")):
            return "critical"
        if any(w in text for w in ("crack", "leak", "broken", "failed", "damage", "rot", "missing")):
            return "major"
        if any(w in text for w in ("worn", "aged", "loose", "minor", "small")):
            return "minor"
        if any(w in text for w in ("scratch", "stain", "faded", "paint", "cosmetic")):
            return "cosmetic"
        return "minor"


@lru_cache(maxsize=1)
def get_severity_classifier() -> SeverityClassifierService:
    return SeverityClassifierService()
