"""Supabase client service for database and storage operations."""

import asyncio
import logging
from functools import lru_cache
from typing import Any

from supabase import Client, create_client

from app.config import get_settings

logger = logging.getLogger(__name__)


class SupabaseClient:
    """Client for interacting with Supabase (PostgREST + Storage).

    Uses the official supabase-py SDK with service-role key so all
    operations bypass RLS. Sync SDK calls are dispatched via
    asyncio.to_thread to keep the async interface non-blocking.
    """

    def __init__(self) -> None:
        settings = get_settings()
        self._client: Client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )

    # ------------------------------------------------------------------
    # Storage
    # ------------------------------------------------------------------

    async def download_file(self, bucket: str, path: str) -> bytes:
        """Download a file from Supabase Storage."""
        result: bytes = await asyncio.to_thread(
            self._client.storage.from_(bucket).download, path
        )
        return result

    async def upload_file(
        self,
        bucket: str,
        path: str,
        content: bytes,
        content_type: str = "application/octet-stream",
    ) -> dict[str, Any]:
        """Upload a file to Supabase Storage."""
        result = await asyncio.to_thread(
            self._client.storage.from_(bucket).upload,
            path,
            content,
            {"content-type": content_type},
        )
        return result

    # ------------------------------------------------------------------
    # Photos
    # ------------------------------------------------------------------

    async def update_photo_analysis(self, photo_id: str, analysis: dict[str, Any]) -> None:
        """Update a photo record with AI analysis results."""
        await asyncio.to_thread(
            lambda: self._client.table("photos")
            .update(
                {
                    "ai_caption": analysis.get("caption"),
                    "ai_objects": analysis.get("objects"),
                    "ai_condition": analysis.get("condition"),
                    "ai_confidence": analysis.get("condition_confidence"),
                    "processed_at": "now()",
                }
            )
            .eq("id", photo_id)
            .execute()
        )
        logger.info("Updated photo %s with analysis results", photo_id)

    async def update_photo_error(self, photo_id: str, error: str) -> None:
        """Update a photo record with an error message."""
        await asyncio.to_thread(
            lambda: self._client.table("photos")
            .update({"error": error})
            .eq("id", photo_id)
            .execute()
        )
        logger.error("Recorded error for photo %s: %s", photo_id, error)

    async def get_photo(self, photo_id: str) -> dict[str, Any] | None:
        """Get a photo record by ID."""
        response = await asyncio.to_thread(
            lambda: self._client.table("photos").select("*").eq("id", photo_id).execute()
        )
        return response.data[0] if response.data else None

    # ------------------------------------------------------------------
    # Voice notes
    # ------------------------------------------------------------------

    async def update_voice_note(
        self, voice_note_id: str, transcript: str, summary: str | None = None
    ) -> None:
        """Update a voice note with transcription results."""
        await asyncio.to_thread(
            lambda: self._client.table("voice_notes")
            .update(
                {
                    "transcript": transcript,
                    "summary": summary,
                    "processed_at": "now()",
                }
            )
            .eq("id", voice_note_id)
            .execute()
        )
        logger.info("Updated voice note %s with transcription", voice_note_id)

    async def update_voice_note_error(self, voice_note_id: str, error: str) -> None:
        """Update a voice note with an error message."""
        await asyncio.to_thread(
            lambda: self._client.table("voice_notes")
            .update({"error": error})
            .eq("id", voice_note_id)
            .execute()
        )
        logger.error("Recorded error for voice note %s: %s", voice_note_id, error)

    async def get_voice_note(self, voice_note_id: str) -> dict[str, Any] | None:
        """Get a voice note record by ID."""
        response = await asyncio.to_thread(
            lambda: self._client.table("voice_notes")
            .select("*")
            .eq("id", voice_note_id)
            .execute()
        )
        return response.data[0] if response.data else None

    # ------------------------------------------------------------------
    # Findings
    # ------------------------------------------------------------------

    async def create_finding(self, finding: dict[str, Any]) -> dict[str, Any]:
        """Create a new AI-generated finding."""
        response = await asyncio.to_thread(
            lambda: self._client.table("findings")
            .insert({**finding, "is_ai_generated": True})
            .execute()
        )
        created = response.data[0] if response.data else {}
        logger.info("Created finding: %s", created.get("id", "unknown"))
        return created

    async def update_finding_embedding(self, finding_id: str, embedding: list[float]) -> None:
        """Update a finding with its vector embedding."""
        await asyncio.to_thread(
            lambda: self._client.table("findings")
            .update({"embedding": embedding})
            .eq("id", finding_id)
            .execute()
        )
        logger.info("Updated finding %s with embedding", finding_id)

    # ------------------------------------------------------------------
    # pgvector similarity search
    # ------------------------------------------------------------------

    async def search_similar_findings(
        self, embedding: list[float], threshold: float = 0.7, limit: int = 5
    ) -> list[dict[str, Any]]:
        """Search for similar findings using pgvector."""
        response = await asyncio.to_thread(
            lambda: self._client.rpc(
                "search_similar_findings",
                {
                    "query_embedding": embedding,
                    "match_threshold": threshold,
                    "match_count": limit,
                },
            ).execute()
        )
        return response.data


@lru_cache
def get_supabase_client() -> SupabaseClient:
    """Get cached Supabase client instance."""
    return SupabaseClient()
