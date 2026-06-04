"""FastAPI ML Service for InspectAI.

This service orchestrates AI-powered analysis for property inspections via
HuggingFace Inference Providers (serverless, CPU-only, pay-per-call):
- Image analysis (captioning, object detection, condition classification)
- Speech recognition (voice note transcription via Whisper)
- Text embeddings (for pgvector similarity search)
- Cost estimation (repair cost estimates)
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings, MODELS
from app.models.schemas import HealthResponse
from app.routers import (
    analyze_router,
    costs_router,
    embeddings_router,
    transcribe_router,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting InspectAI ML Service...")
    settings = get_settings()
    logger.info("Debug mode: %s", settings.debug)
    hf_configured = bool(settings.huggingface_token)
    logger.info("HuggingFace token configured: %s", hf_configured)
    yield
    logger.info("Shutting down InspectAI ML Service...")


app = FastAPI(
    title="InspectAI ML Service",
    description="ML backend for property inspection analysis (HF Inference Providers)",
    version="0.1.0",
    lifespan=lifespan,
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)
app.include_router(transcribe_router)
app.include_router(embeddings_router)
app.include_router(costs_router)


@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check() -> HealthResponse:
    """Check service health and HuggingFace token configuration."""
    settings = get_settings()
    hf_ready = bool(settings.huggingface_token)
    supabase_ready = bool(settings.supabase_url and settings.supabase_service_role_key)

    models_loaded = {
        "image_caption": hf_ready,
        "object_detection": hf_ready,
        "condition_classifier": hf_ready,
        "speech_recognition": hf_ready,
        "summarization": hf_ready,
        "embeddings": hf_ready,
    }

    status = "healthy" if hf_ready and supabase_ready else "unhealthy"

    return HealthResponse(
        status=status,
        service="ml-service",
        version="0.1.0",
        models_loaded=models_loaded,
    )


@app.get("/", tags=["root"])
async def root():
    return {
        "service": "InspectAI ML Service",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/models", tags=["info"])
async def get_models():
    return {
        "models": MODELS,
        "provider": "HuggingFace Inference Providers (serverless)",
    }
