"""Supabase client service for database and storage operations."""

import logging
from functools import lru_cache
from typing import Any

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)


class SupabaseClient:
    """Client for interacting with Supabase (PostgreSQL + Storage)."""

    def __init__(self):
        settings = get_settings()
        self.url = settings.supabase_url
        self.key = settings.supabase_service_role_key
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
        }

    @property
    def rest_url(self) -> str:
        """Get the REST API URL."""
        return f"{self.url}/rest/v1"

    @property
    def storage_url(self) -> str:
        """Get the Storage API URL."""
        return f"{self.url}/storage/v1"

    async def download_file(self, bucket: str, path: str) -> bytes:
        """Download a file from Supabase Storage."""
        url = f"{self.storage_url}/object/{bucket}/{path}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            return response.content

    async def upload_file(
        self, bucket: str, path: str, content: bytes, content_type: str = "application/octet-stream"
    ) -> dict[str, Any]:
        """Upload a file to Supabase Storage."""
        url = f"{self.storage_url}/object/{bucket}/{path}"
        headers = {**self.headers, "Content-Type": content_type}
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, content=content)
            response.raise_for_status()
            return response.json()

    async def update_photo_analysis(self, photo_id: str, analysis: dict[str, Any]) -> None:
        """Update a photo record with AI analysis results."""
        url = f"{self.rest_url}/photos?id=eq.{photo_id}"
        data = {
            "ai_caption": analysis.get("caption"),
            "ai_objects": analysis.get("objects"),
            "ai_condition": analysis.get("condition"),
            "ai_confidence": analysis.get("condition_confidence"),
            "processed_at": "now()",
        }
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                url,
                headers={**self.headers, "Prefer": "return=minimal"},
                json=data,
            )
            response.raise_for_status()
        logger.info(f"Updated photo {photo_id} with analysis results")

    async def update_photo_error(self, photo_id: str, error: str) -> None:
        """Update a photo record with an error message."""
        url = f"{self.rest_url}/photos?id=eq.{photo_id}"
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                url,
                headers={**self.headers, "Prefer": "return=minimal"},
                json={"error": error},
            )
            response.raise_for_status()
        logger.error(f"Recorded error for photo {photo_id}: {error}")

    async def create_finding(self, finding: dict[str, Any]) -> dict[str, Any]:
        """Create a new AI-generated finding."""
        url = f"{self.rest_url}/findings"
        data = {
            **finding,
            "is_ai_generated": True,
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers={**self.headers, "Prefer": "return=representation"},
                json=data,
            )
            response.raise_for_status()
            result = response.json()
            logger.info(f"Created finding: {result[0]['id'] if result else 'unknown'}")
            return result[0] if result else {}

    async def update_voice_note(
        self, voice_note_id: str, transcript: str, summary: str | None = None
    ) -> None:
        """Update a voice note with transcription results."""
        url = f"{self.rest_url}/voice_notes?id=eq.{voice_note_id}"
        data = {
            "transcript": transcript,
            "summary": summary,
            "processed_at": "now()",
        }
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                url,
                headers={**self.headers, "Prefer": "return=minimal"},
                json=data,
            )
            response.raise_for_status()
        logger.info(f"Updated voice note {voice_note_id} with transcription")

    async def update_voice_note_error(self, voice_note_id: str, error: str) -> None:
        """Update a voice note with an error message."""
        url = f"{self.rest_url}/voice_notes?id=eq.{voice_note_id}"
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                url,
                headers={**self.headers, "Prefer": "return=minimal"},
                json={"error": error},
            )
            response.raise_for_status()
        logger.error(f"Recorded error for voice note {voice_note_id}: {error}")

    async def update_finding_embedding(self, finding_id: str, embedding: list[float]) -> None:
        """Update a finding with its vector embedding."""
        url = f"{self.rest_url}/findings?id=eq.{finding_id}"
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                url,
                headers={**self.headers, "Prefer": "return=minimal"},
                json={"embedding": embedding},
            )
            response.raise_for_status()
        logger.info(f"Updated finding {finding_id} with embedding")

    async def search_similar_findings(
        self, embedding: list[float], threshold: float = 0.7, limit: int = 5
    ) -> list[dict[str, Any]]:
        """Search for similar findings using pgvector."""
        url = f"{self.rest_url}/rpc/search_similar_findings"
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers=self.headers,
                json={
                    "query_embedding": embedding,
                    "match_threshold": threshold,
                    "match_count": limit,
                },
            )
            response.raise_for_status()
            return response.json()

    async def get_photo(self, photo_id: str) -> dict[str, Any] | None:
        """Get a photo record by ID."""
        url = f"{self.rest_url}/photos?id=eq.{photo_id}&select=*"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            result = response.json()
            return result[0] if result else None

    async def get_voice_note(self, voice_note_id: str) -> dict[str, Any] | None:
        """Get a voice note record by ID."""
        url = f"{self.rest_url}/voice_notes?id=eq.{voice_note_id}&select=*"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            result = response.json()
            return result[0] if result else None


@lru_cache
def get_supabase_client() -> SupabaseClient:
    """Get cached Supabase client instance."""
    return SupabaseClient()
