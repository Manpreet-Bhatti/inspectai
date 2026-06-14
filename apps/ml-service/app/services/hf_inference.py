"""HuggingFace Inference Providers client (serverless, pay-per-call)."""

import logging
from functools import lru_cache
from huggingface_hub import InferenceClient
from app.config import get_settings

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_client() -> InferenceClient:
    settings = get_settings()
    return InferenceClient(token=settings.huggingface_token)


def caption_image(image_bytes: bytes, model_id: str) -> str:
    result = get_client().image_to_text(image_bytes, model=model_id)
    return result if isinstance(result, str) else str(result)


def detect_objects(image_bytes: bytes, model_id: str) -> list[dict]:
    results = get_client().object_detection(image_bytes, model=model_id)
    objects = []
    for obj in results:
        box = obj.box
        objects.append({
            "label": obj.label,
            "score": obj.score,
            "box": {
                "xmin": box.xmin,
                "ymin": box.ymin,
                "xmax": box.xmax,
                "ymax": box.ymax,
            },
        })
    return objects


def classify_condition(
    image_bytes: bytes, model_id: str, labels: list[str]
) -> list[dict]:
    results = get_client().zero_shot_image_classification(
        image_bytes, model=model_id, candidate_labels=labels
    )
    return [{"label": r.label, "score": r.score} for r in results]


def transcribe_audio(audio_bytes: bytes, model_id: str) -> str:
    result = get_client().automatic_speech_recognition(audio_bytes, model=model_id)
    return result.text


def summarize_text(text: str, model_id: str) -> str:
    result = get_client().summarization(text, model=model_id)
    if isinstance(result, list):
        return result[0].summary_text if result else text
    return result.summary_text


def embed_text(text: str, model_id: str) -> list[float]:
    result = get_client().feature_extraction(text, model=model_id)
    if hasattr(result, "tolist"):
        flat = result.tolist()
    else:
        flat = list(result)
    # Sentence transformer models return [[vector]] (2D) — flatten if needed
    if flat and isinstance(flat[0], list):
        flat = flat[0]
    return flat


def classify_text_zero_shot(
    text: str, model_id: str, labels: list[str]
) -> list[dict]:
    """Zero-shot text classification using a textual entailment model (e.g. MNLI).

    Returns [{label, score}, ...] sorted by score descending.
    """
    result = get_client().zero_shot_classification(
        text, candidate_labels=labels, model=model_id
    )
    return [
        {"label": lbl, "score": float(score)}
        for lbl, score in zip(result.labels, result.scores)
    ]
