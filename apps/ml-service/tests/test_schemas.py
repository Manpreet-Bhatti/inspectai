"""Tests for Pydantic schemas."""

import pytest

from pydantic import ValidationError
from app.models.schemas import (
    AnalyzePhotoRequest,
    CostEstimateRequest,
    DetectedObject,
    EmbeddingRequest,
    Finding,
    ImageAnalysis,
    TranscribeRequest,
)


class TestDetectedObject:
    """Tests for DetectedObject schema."""

    def test_valid_object(self):
        """Test creating a valid detected object."""
        obj = DetectedObject(
            label="window",
            confidence=0.95,
            bbox=[100, 200, 50, 75],
        )
        assert obj.label == "window"
        assert obj.confidence == 0.95
        assert obj.bbox == [100, 200, 50, 75]

    def test_object_without_bbox(self):
        """Test creating object without bounding box."""
        obj = DetectedObject(label="wall", confidence=0.8)
        assert obj.label == "wall"
        assert obj.bbox is None

    def test_invalid_confidence(self):
        """Test that invalid confidence raises error."""
        with pytest.raises(ValidationError):
            DetectedObject(label="test", confidence=1.5)


class TestFinding:
    """Tests for Finding schema."""

    def test_valid_finding(self):
        """Test creating a valid finding."""
        finding = Finding(
            title="Water damage detected",
            description="Visible water staining on ceiling",
            category="plumbing",
            severity="major",
            confidence=0.85,
            location="Living room ceiling",
        )
        assert finding.title == "Water damage detected"
        assert finding.category == "plumbing"
        assert finding.severity == "major"


class TestImageAnalysis:
    """Tests for ImageAnalysis schema."""

    def test_valid_analysis(self):
        """Test creating a valid image analysis."""
        analysis = ImageAnalysis(
            caption="A damaged roof with missing shingles",
            condition="damaged",
            condition_confidence=0.9,
            objects=[DetectedObject(label="roof", confidence=0.95)],
            suggested_findings=[],
            suggested_category="roof",
        )
        assert analysis.caption == "A damaged roof with missing shingles"
        assert analysis.condition == "damaged"
        assert len(analysis.objects) == 1

    def test_default_values(self):
        """Test default values."""
        analysis = ImageAnalysis(
            caption="Test",
            condition="good condition",
            condition_confidence=0.5,
        )
        assert analysis.objects == []
        assert analysis.suggested_findings == []
        assert analysis.suggested_category == "other"


class TestRequests:
    """Tests for request schemas."""

    def test_analyze_photo_request(self):
        """Test AnalyzePhotoRequest."""
        request = AnalyzePhotoRequest(
            photo_id="123e4567-e89b-12d3-a456-426614174000",
            storage_path="user123/inspection456/photo.jpg",
            inspection_id="123e4567-e89b-12d3-a456-426614174001",
        )
        assert request.callback_url is None

    def test_transcribe_request(self):
        """Test TranscribeRequest."""
        request = TranscribeRequest(
            voice_note_id="123e4567-e89b-12d3-a456-426614174000",
            storage_path="user123/inspection456/voice.webm",
            inspection_id="123e4567-e89b-12d3-a456-426614174001",
        )
        assert request.callback_url is None

    def test_embedding_request(self):
        """Test EmbeddingRequest."""
        request = EmbeddingRequest(
            text="Water damage on ceiling near bathroom",
        )
        assert request.finding_id is None

    def test_cost_estimate_request(self):
        """Test CostEstimateRequest."""
        request = CostEstimateRequest(
            category="plumbing",
            severity="major",
            description="Leaking pipe under kitchen sink",
        )
        assert request.category == "plumbing"
        assert request.severity == "major"
