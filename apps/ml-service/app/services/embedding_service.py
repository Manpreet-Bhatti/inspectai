"""Embedding service for generating text embeddings."""

import logging
from typing import Any

from app.config import MODELS, get_settings

logger = logging.getLogger(__name__)

# Lazy load model
_embedding_model = None


def _get_embedding_model():
    """Lazy load the sentence transformer model."""
    global _embedding_model
    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer

        model_config = MODELS["embeddings"]
        _embedding_model = SentenceTransformer(model_config["model_id"])
        logger.info(f"Loaded embedding model: {model_config['model_id']}")
    return _embedding_model


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
            logger.debug(f"Generated embedding for text ({len(text)} chars)")
            return embedding_list
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
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
            logger.error(f"Batch embedding generation failed: {e}")
            return [[0.0] * self.dimensions for _ in texts]

    async def compute_similarity(
        self, embedding1: list[float], embedding2: list[float]
    ) -> float:
        """Compute cosine similarity between two embeddings."""
        import numpy as np

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


# Singleton instance
_service: EmbeddingService | None = None


def get_embedding_service() -> EmbeddingService:
    """Get the embedding service instance."""
    global _service
    if _service is None:
        _service = EmbeddingService()
    return _service
