"""Embedding service for generating text embeddings."""

import logging
import numpy as np

from typing import Any
from app.config import MODELS
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = None


def _get_embedding_model():
    """Lazy load the sentence transformer model."""

    if EMBEDDING_MODEL is None:
        model_config = MODELS["embeddings"]
        EMBEDDING_MODEL = SentenceTransformer(model_config["model_id"])
        logger.info("Loaded embedding model: %s", model_config['model_id'])
    return EMBEDDING_MODEL


class EmbeddingService:
    """Service for generating text embeddings using sentence-transformers."""

    def __init__(self):
        self.model_config = MODELS["embeddings"]
        self.dimensions = self.model_config["dimensions"]

    async def generate_embedding(self, text: str) -> list[float]:
        """Generate an embedding vector for the given text."""
        if not text:
            return [0.0] * self.dimensions

        try:
            model = _get_embedding_model()
            embedding = model.encode(text, convert_to_numpy=True)
            embedding_list = embedding.tolist()
            logger.debug("Generated embedding for text (%d chars)", len(text))
            return embedding_list
        except Exception as e:
            logger.error("Embedding generation failed: %s", e)
            return [0.0] * self.dimensions

    async def generate_embeddings_batch(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for multiple texts."""
        if not texts:
            return []

        try:
            model = _get_embedding_model()
            embeddings = model.encode(texts, convert_to_numpy=True)
            return [emb.tolist() for emb in embeddings]
        except Exception as e:
            logger.error("Batch embedding generation failed: %s", e)
            return [[0.0] * self.dimensions for _ in texts]

    async def compute_similarity(
        self, embedding1: list[float], embedding2: list[float]
    ) -> float:
        """Compute cosine similarity between two embeddings."""

        v1 = np.array(embedding1)
        v2 = np.array(embedding2)

        # Cosine similarity
        dot_product = np.dot(v1, v2)
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return float(dot_product / (norm1 * norm2))

    def get_model_info(self) -> dict[str, Any]:
        """Get information about the embedding model."""
        return {
            "model_id": self.model_config["model_id"],
            "dimensions": self.dimensions,
            "task": self.model_config["task"],
        }


_service: EmbeddingService | None = None


def get_embedding_service() -> EmbeddingService:
    """Get the embedding service instance."""

    if _service is None:
        _service = EmbeddingService()
    return _service
