"""Tests for the main FastAPI application."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Create a test client."""
    return TestClient(app)


def test_root(test_client):
    """Test root endpoint."""
    response = test_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "InspectAI ML Service"
    assert "version" in data


def test_health(test_client):
    """Test health endpoint."""
    response = test_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "ml-service"
    assert "models_loaded" in data


def test_models_info(test_client):
    """Test models info endpoint."""
    response = test_client.get("/models")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert "image_caption" in data["models"]
    assert "speech_recognition" in data["models"]
    assert "embeddings" in data["models"]
