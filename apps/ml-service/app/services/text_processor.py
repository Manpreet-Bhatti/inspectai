"""Text processing service for summarization and NLP tasks."""

import asyncio
import logging
import re
from functools import lru_cache

from app.config import MODELS, FINDING_CATEGORIES
import app.services.hf_inference as hf_inference

logger = logging.getLogger(__name__)


class TextProcessorService:
    """Service for text processing tasks via HF Inference Providers."""

    async def summarize(
        self, text: str, max_length: int = 150, min_length: int = 30
    ) -> str:
        """Summarize text using BART via HF Inference."""
        if not text or len(text.strip()) < min_length:
            return text.strip()

        try:
            model_id = MODELS["summarization"]["model_id"]
            summary = await asyncio.to_thread(
                hf_inference.summarize_text, text, model_id
            )
            logger.debug("Generated summary: %d -> %d chars", len(text), len(summary))
            return summary
        except Exception as e:
            logger.error("Summarization failed: %s", e)
            return text[:max_length] + "..." if len(text) > max_length else text

    async def extract_key_points(self, transcript: str) -> list[str]:
        """Extract key points from a transcript."""
        if not transcript:
            return []

        sentences = self._split_sentences(transcript)
        if len(sentences) <= 3:
            return sentences

        summary = await self.summarize(transcript, max_length=200, min_length=50)
        return self._split_sentences(summary)

    def _split_sentences(self, text: str) -> list[str]:
        sentences = re.split(r"[.!?]+", text)
        return [s.strip() for s in sentences if s.strip()]

    async def categorize_text(self, text: str) -> dict[str, float]:
        """Categorize text by inspection category using keyword matching."""
        text_lower = text.lower()
        scores = {}

        category_keywords = {
            "structural": ["structure", "foundation", "wall", "beam", "crack", "support"],
            "electrical": ["electric", "wire", "outlet", "panel", "circuit", "power"],
            "plumbing": ["plumb", "pipe", "leak", "faucet", "drain", "water"],
            "hvac": ["hvac", "heating", "cooling", "vent", "duct", "air"],
            "roofing": ["roof", "shingle", "gutter", "flash", "chimney"],
            "exterior": ["exterior", "siding", "window", "door", "deck", "fence"],
            "interior": ["interior", "floor", "ceiling", "carpet", "tile", "paint"],
            "appliances": ["appliance", "stove", "refrigerator", "washer", "dryer"],
            "safety": ["safety", "mold", "asbestos", "smoke", "carbon", "hazard"],
            "cosmetic": ["cosmetic", "scratch", "stain", "wear", "faded", "minor"],
        }

        for category in FINDING_CATEGORIES:
            keywords = category_keywords.get(category, [category])
            match_count = sum(1 for kw in keywords if kw in text_lower)
            scores[category] = min(match_count / len(keywords), 1.0)

        return scores


@lru_cache(maxsize=1)
def get_text_processor_service() -> TextProcessorService:
    return TextProcessorService()
