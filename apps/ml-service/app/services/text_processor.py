"""Text processing service for summarization and NLP tasks."""

import logging
import re
from functools import lru_cache
from transformers import pipeline as hf_pipeline

from app.config import MODELS
from app.config import FINDING_CATEGORIES

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def _get_summarizer_pipeline():
    """Lazy load the summarization pipeline."""

    model_config = MODELS["summarization"]
    pipe = hf_pipeline(
        model_config["task"],
        model=model_config["model_id"],
        device="cpu",
    )
    logger.info("Loaded summarization model: %s", model_config['model_id'])
    return pipe


class TextProcessorService:
    """Service for text processing tasks."""

    async def summarize(
        self, text: str, max_length: int = 150, min_length: int = 30
    ) -> str:
        """Summarize text using BART."""
        if not text or len(text.strip()) < min_length:
            return text.strip()

        try:
            summarizer = _get_summarizer_pipeline()
            result = summarizer(
                text,
                max_length=max_length,
                min_length=min_length,
                do_sample=False,
            )
            summary = result[0]["summary_text"]
            logger.debug(
                "Generated summary: %d -> %d chars", len(text), len(summary))
            return summary
        except (OSError, RuntimeError, KeyError) as e:
            logger.error("Summarization failed: %s", e)
            # Return truncated original text as fallback
            return text[:max_length] + "..." if len(text) > max_length else text

    async def extract_key_points(self, transcript: str) -> list[str]:
        """Extract key points from a transcript."""
        if not transcript:
            return []

        # Split into sentences
        sentences = self._split_sentences(transcript)

        if len(sentences) <= 3:
            return sentences

        # Use summarization to extract key points
        summary = await self.summarize(transcript, max_length=200, min_length=50)
        return self._split_sentences(summary)

    def _split_sentences(self, text: str) -> list[str]:
        """Split text into sentences."""

        # Simple sentence splitting
        sentences = re.split(r"[.!?]+", text)
        return [s.strip() for s in sentences if s.strip()]

    async def categorize_text(self, text: str) -> dict[str, float]:
        """Categorize text by inspection category."""

        text_lower = text.lower()
        scores = {}

        # Simple keyword-based categorization
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
    """Get the text processor service instance."""

    return TextProcessorService()
