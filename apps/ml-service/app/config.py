"""Configuration settings for the ML service application."""

from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Supabase
    supabase_url: str = ""
    supabase_service_role_key: str = ""

    # HuggingFace
    huggingface_token: str = ""

    # Upstash Redis (rate limiting — optional; set both vars to enable)
    upstash_redis_rest_url: str = ""
    upstash_redis_rest_token: str = ""

    # Model cache
    model_cache_dir: str = "./models"

    # Service settings
    debug: bool = False
    log_level: str = "INFO"

    # CORS
    cors_origins: list[str] = ["http://localhost:3000"]

    class Config:
        """Specifies .env files as the source for environment variables."""

        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Model configurations for HuggingFace
MODELS = {
    "image_caption": {
        "model_id": "Salesforce/blip-image-captioning-large",
        "task": "image-to-text",
        "fallback": "Salesforce/blip-image-captioning-base",
    },
    "object_detection": {
        "model_id": "facebook/detr-resnet-50",
        "task": "object-detection",
    },
    "condition_classifier": {
        "model_id": "openai/clip-vit-base-patch32",
        "task": "zero-shot-image-classification",
        "labels": ["good condition", "fair condition", "poor condition", "damaged"],
    },
    "speech_recognition": {
        "model_id": "openai/whisper-base",
        "task": "automatic-speech-recognition",
    },
    "summarization": {
        "model_id": "facebook/bart-large-cnn",
        "task": "summarization",
    },
    "embeddings": {
        "model_id": "sentence-transformers/all-MiniLM-L6-v2",
        "task": "feature-extraction",
        "dimensions": 384,
    },
}

# Finding categories for property inspections
FINDING_CATEGORIES = [
    "structural",
    "electrical",
    "plumbing",
    "hvac",
    "roofing",
    "exterior",
    "interior",
    "appliances",
    "safety",
    "cosmetic",
]

# Severity levels
SEVERITY_LEVELS = ["critical", "major", "minor", "cosmetic", "info"]

# Cost estimation ranges by category and severity (CAD)
COST_ESTIMATES = {
    "structural": {
        "critical": (30000, 100000),
        "major": (10000, 30000),
        "minor": (2500, 8000),
        "cosmetic": (500, 2500),
    },
    "electrical": {
        "critical": (10000, 35000),
        "major": (2500, 8000),
        "minor": (500, 2000),
        "cosmetic": (150, 800),
    },
    "plumbing": {
        "critical": (10000, 30000),
        "major": (2500, 10000),
        "minor": (500, 2500),
        "cosmetic": (150, 500),
    },
    "hvac": {
        "critical": (15000, 35000),
        "major": (4000, 9000),
        "minor": (300, 1200),
        "cosmetic": (100, 300),
    },
    "roofing": {
        "critical": (25000, 50000),
        "major": (8000, 18000),
        "minor": (800, 3000),
        "cosmetic": (200, 800),
    },
    "exterior": {
        "critical": (30000, 60000),
        "major": (10000, 25000),
        "minor": (2000, 7000),
        "cosmetic": (500, 2000),
    },
    "interior": {
        "critical": (50000, 100000),
        "major": (10000, 35000),
        "minor": (1500, 5000),
        "cosmetic": (300, 1500),
    },
    "appliances": {
        "critical": (15000, 40000),
        "major": (1500, 5000),
        "minor": (400, 1000),
        "cosmetic": (100, 400),
    },
    "safety": {
        "critical": (10000, 25000),
        "major": (2500, 7500),
        "minor": (500, 2000),
        "cosmetic": (50, 200),
    },
    "cosmetic": {
        "critical": (100000, 300000),
        "major": (25000, 75000),
        "minor": (5000, 20000),
        "cosmetic": (1000, 5000),
    },
}
