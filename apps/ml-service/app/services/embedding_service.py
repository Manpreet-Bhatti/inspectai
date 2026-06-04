"""Embedding service for generating text embeddings via HF Inference Providers."""

import asyncio
import logging
from functools import lru_cache
from typing import Any

import numpy as np

from app.config import MODELS
import app.services.hf_inference as hf_inference

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Service for generating text embeddings via HF Inference Providers."""

    def __init__(self):
        self.model_config = MODELS["embeddings"]
        self.dimensions = self.model_config["dimensions"]

    async def generate_embedding(self, text: str) -> list[float]:
        """Generate an embedding vector for the given text."""
        if not text:
            return [0.0] * self.dimensions

        try:
            model_id = self.model_config["model_id"]
            embedding = await asyncio.to_thread(
                hf_inference.embed_text, text, model_id
            )
            logger.debug("Generated embedding for text (%d chars)", len(text))
            return embedding
        except Exception as e:
            logger.error("Embedding generation failed: %s", e)
            return [0.0] * self.dimensions

    async def generate_embeddings_batch(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for multiple texts sequentially."""
        if not texts:
            return []

        results = []
        for text in texts:
            embedding = await self.generate_embedding(text)
            results.append(embedding)
        return results

    async def compute_similarity(
        self, embedding1: list[float], embedding2: list[float]
    ) -> float:
        """Compute cosine similarity between two embeddings."""
        v1 = np.array(embedding1)
        v2 = np.array(embedding2)

        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return float(np.dot(v1, v2) / (norm1 * norm2))

    def get_model_info(self) -> dict[str, Any]:
        return {
            "model_id": self.model_config["model_id"],
            "dimensions": self.dimensions,
            "task": self.model_config["task"],
        }


@lru_cache(maxsize=1)
def get_embedding_service() -> EmbeddingService:
    return EmbeddingService()
