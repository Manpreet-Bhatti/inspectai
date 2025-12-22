"""Embeddings API router."""

import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    EmbeddingRequest,
    EmbeddingResponse,
    SimilarFindingRequest,
    SimilarFindingResponse,
    SimilarFindingResult,
)
from app.services.embedding_service import get_embedding_service
from app.services.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/embeddings", tags=["embeddings"])


@router.post("", response_model=EmbeddingResponse)
async def generate_embedding(request: EmbeddingRequest) -> EmbeddingResponse:
    """Generate an embedding vector for text.

    If a finding_id is provided, the embedding will also be stored
    in the database for that finding.
    """
    logger.info("Generating embedding for text (%s chars)", len(request.text))

    embedding_service = get_embedding_service()

    try:
        embedding = await embedding_service.generate_embedding(request.text)

        # Store embedding if finding_id provided
        if request.finding_id:
            supabase = get_supabase_client()
            await supabase.update_finding_embedding(request.finding_id, embedding)
            logger.info("Stored embedding for finding %s", request.finding_id)

        model_info = embedding_service.get_model_info()

        return EmbeddingResponse(
            embedding=embedding,
            dimensions=len(embedding),
            model=model_info["model_id"],
        )

    except Exception as e:
        logger.error("Embedding generation failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/batch", response_model=list[EmbeddingResponse])
async def generate_embeddings_batch(texts: list[str]) -> list[EmbeddingResponse]:
    """Generate embeddings for multiple texts in batch."""
    if not texts:
        return []

    if len(texts) > 100:
        raise HTTPException(
            status_code=400,
            detail="Maximum 100 texts per batch",
        )

    logger.info("Generating batch embeddings for %s texts", len(texts))

    embedding_service = get_embedding_service()

    try:
        embeddings = await embedding_service.generate_embeddings_batch(texts)
        model_info = embedding_service.get_model_info()

        return [
            EmbeddingResponse(
                embedding=emb,
                dimensions=len(emb),
                model=model_info["model_id"],
            )
            for emb in embeddings
        ]

    except Exception as e:
        logger.error("Batch embedding generation failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/similar", response_model=SimilarFindingResponse)
async def find_similar_findings(
    request: SimilarFindingRequest,
) -> SimilarFindingResponse:
    """Find similar findings using vector similarity search.

    You can provide either text (which will be converted to an embedding)
    or a pre-computed embedding vector.
    """
    if not request.text and not request.embedding:
        raise HTTPException(
            status_code=400,
            detail="Either text or embedding must be provided",
        )

    embedding_service = get_embedding_service()
    supabase = get_supabase_client()

    try:
        # Generate embedding if text provided
        if request.text:
            query_embedding = await embedding_service.generate_embedding(request.text)
        else:
            query_embedding = request.embedding

        # Search for similar findings
        results = await supabase.search_similar_findings(
            query_embedding,
            threshold=request.threshold,
            limit=request.limit,
        )

        findings = [
            SimilarFindingResult(
                id=r["id"],
                inspection_id=r["inspection_id"],
                title=r["title"],
                description=r["description"],
                category=r["category"],
                severity=r["severity"],
                cost_estimate=r.get("cost_estimate"),
                similarity=r["similarity"],
            )
            for r in results
        ]

        logger.info("Found %s similar findings", len(findings))

        return SimilarFindingResponse(
            findings=findings,
            query_embedding=query_embedding if request.text else None,
        )

    except Exception as e:
        logger.error("Similar findings search failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e
