"""Image analysis service using HuggingFace Inference Providers."""

import asyncio
import logging
from functools import lru_cache

from app.config import MODELS
from app.models.schemas import (
    DetectedObject,
    Finding,
    ImageAnalysis,
    PhotoCategory,
)
import app.services.hf_inference as hf_inference
from app.services.severity_classifier import get_severity_classifier

logger = logging.getLogger(__name__)


class ImageAnalyzerService:
    """Service for analyzing property inspection images via HF Inference Providers."""

    ISSUE_KEYWORDS = {
        "structural": ["crack", "foundation", "wall damage", "beam", "support", "settling"],
        "electrical": ["wire", "outlet", "panel", "electrical", "switch", "circuit"],
        "plumbing": ["pipe", "leak", "faucet", "drain", "water damage", "plumbing"],
        "hvac": ["duct", "vent", "hvac", "air conditioning", "heating", "furnace"],
        "roofing": ["roof", "shingle", "gutter", "flashing", "chimney"],
        "exterior": ["siding", "paint", "window", "door", "deck", "fence"],
        "interior": ["floor", "ceiling", "wall", "carpet", "tile", "drywall"],
        "appliances": ["appliance", "stove", "refrigerator", "washer", "dryer"],
        "safety": ["mold", "asbestos", "radon", "smoke detector", "carbon monoxide"],
        "cosmetic": ["stain", "scratch", "wear", "faded", "discolored"],
    }

    CATEGORY_MAPPING = {
        "exterior": ["house", "building", "car", "tree", "fence", "garage"],
        "interior": ["couch", "bed", "chair", "table", "tv", "refrigerator"],
        "roof": ["roof", "chimney"],
        "foundation": ["foundation", "basement"],
        "electrical": ["outlet", "switch", "panel"],
        "plumbing": ["sink", "toilet", "bathtub", "faucet"],
        "hvac": ["vent", "duct", "thermostat"],
        "structural": ["wall", "beam", "column"],
    }

    async def analyze_image(self, image_bytes: bytes) -> ImageAnalysis:
        """Analyze an image and return structured results."""
        caption = await self._generate_caption(image_bytes)
        objects = await self._detect_objects(image_bytes)
        condition, confidence = await self._classify_condition(image_bytes)
        category = self._determine_category(objects, caption)
        findings = await self._suggest_findings(caption, objects, condition, confidence)

        return ImageAnalysis(
            caption=caption,
            condition=condition,
            condition_confidence=confidence,
            objects=objects,
            suggested_findings=findings,
            suggested_category=category,
        )

    async def _generate_caption(self, image_bytes: bytes) -> str:
        try:
            model_id = MODELS["image_caption"]["model_id"]
            caption = await asyncio.to_thread(
                hf_inference.caption_image, image_bytes, model_id
            )
            logger.debug("Generated caption: %s", caption)
            return caption
        except Exception as e:
            logger.error("Caption generation failed: %s", e)
            return "Caption generation failed"

    async def _detect_objects(self, image_bytes: bytes) -> list[DetectedObject]:
        try:
            model_id = MODELS["object_detection"]["model_id"]
            results = await asyncio.to_thread(
                hf_inference.detect_objects, image_bytes, model_id
            )
            objects = []
            for obj in results[:10]:
                box = obj["box"]
                objects.append(
                    DetectedObject(
                        label=obj["label"],
                        confidence=obj["score"],
                        bbox=[
                            box["xmin"],
                            box["ymin"],
                            box["xmax"] - box["xmin"],
                            box["ymax"] - box["ymin"],
                        ],
                    )
                )
            logger.debug("Detected %d objects", len(objects))
            return objects
        except Exception as e:
            logger.error("Object detection failed: %s", e)
            return []

    async def _classify_condition(self, image_bytes: bytes) -> tuple[str, float]:
        try:
            model_config = MODELS["condition_classifier"]
            results = await asyncio.to_thread(
                hf_inference.classify_condition,
                image_bytes,
                model_config["model_id"],
                model_config["labels"],
            )
            if not results:
                return "unknown", 0.0
            condition = results[0]["label"]
            confidence = results[0]["score"]
            logger.debug("Classified condition: %s (%.2f)", condition, confidence)
            return condition, confidence
        except Exception as e:
            logger.error("Condition classification failed: %s", e)
            return "unknown", 0.0

    def _determine_category(
        self, objects: list[DetectedObject], caption: str
    ) -> PhotoCategory:
        """Determine the photo category based on detected objects and caption."""
        caption_lower = caption.lower()

        for category, keywords in self.CATEGORY_MAPPING.items():
            for keyword in keywords:
                if keyword in caption_lower:
                    return category  # type: ignore

        for obj in objects:
            label_lower = obj.label.lower()
            for category, keywords in self.CATEGORY_MAPPING.items():
                if any(keyword in label_lower for keyword in keywords):
                    return category  # type: ignore

        return "other"

    async def _suggest_findings(
        self,
        caption: str,
        objects: list[DetectedObject],
        condition: str,
        confidence: float,
    ) -> list[Finding]:
        """Suggest potential findings based on analysis results."""
        findings = []
        caption_lower = caption.lower()
        classifier = get_severity_classifier()

        if condition in ["poor condition", "damaged"] and confidence > 0.5:
            for category, keywords in self.ISSUE_KEYWORDS.items():
                for keyword in keywords:
                    if keyword in caption_lower:
                        title = f"Potential {category} issue detected"
                        description = (
                            f"AI analysis detected possible {keyword}-related issue. {caption}"
                        )
                        severity, sev_conf = await classifier.classify(
                            title=title,
                            description=description,
                            category=category,
                            image_condition=condition,
                            image_confidence=confidence,
                        )
                        findings.append(
                            Finding(
                                title=title,
                                description=description,
                                category=category,  # type: ignore
                                severity=severity,  # type: ignore
                                confidence=min(confidence, sev_conf),
                            )
                        )
                        break

        if not findings and condition == "damaged" and confidence > 0.6:
            title = "Damage detected"
            description = f"AI analysis indicates damage in this area. {caption}"
            severity, sev_conf = await classifier.classify(
                title=title,
                description=description,
                category="cosmetic",
                image_condition=condition,
                image_confidence=confidence,
            )
            findings.append(
                Finding(
                    title=title,
                    description=description,
                    category="cosmetic",
                    severity=severity,  # type: ignore
                    confidence=min(confidence, sev_conf),
                )
            )

        return findings[:3]


@lru_cache(maxsize=1)
def get_image_analyzer_service() -> ImageAnalyzerService:
    return ImageAnalyzerService()
