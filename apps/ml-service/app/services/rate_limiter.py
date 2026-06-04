"""Upstash rate limiting for HuggingFace Inference Provider calls.

Uses a sliding window algorithm: 20 inference calls per user per hour.
Rate limiting is disabled gracefully when UPSTASH_REDIS_REST_URL / TOKEN are unset.
"""

import logging
from functools import lru_cache

from fastapi import HTTPException

from app.config import get_settings

logger = logging.getLogger(__name__)

# Limits per user per hour — sized to cap demo spend while allowing normal use
_MAX_REQUESTS_PER_HOUR = 20


@lru_cache(maxsize=1)
def _get_ratelimiter():
    """Return a configured Ratelimit instance, or None if Upstash is not configured."""
    settings = get_settings()
    if not settings.upstash_redis_rest_url or not settings.upstash_redis_rest_token:
        logger.warning(
            "Upstash not configured (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN unset). "
            "Rate limiting disabled."
        )
        return None

    from upstash_redis import Redis
    from upstash_ratelimit import Ratelimit, SlidingWindow

    redis = Redis(
        url=settings.upstash_redis_rest_url,
        token=settings.upstash_redis_rest_token,
    )
    return Ratelimit(
        redis=redis,
        limiter=SlidingWindow(max_requests=_MAX_REQUESTS_PER_HOUR, window="1 h"),
        prefix="inspectai:ratelimit",
    )


async def check_inference_rate_limit(user_id: str | None) -> None:
    """Raise HTTP 429 if the user has exceeded their hourly inference quota.

    Args:
        user_id: Supabase user UUID. Falls back to "global" when not provided
                 so the service is still protected even without user context.
    """
    ratelimiter = _get_ratelimiter()
    if ratelimiter is None:
        return

    identifier = user_id or "global"

    try:
        result = ratelimiter.limit(identifier)
    except Exception as e:
        # Never block requests due to a Redis failure — log and continue.
        logger.error("Rate limit check failed (allowing request): %s", e)
        return

    if not result.allowed:
        retry_after = max(0, result.reset - _current_unix_timestamp())
        logger.warning("Rate limit exceeded for user %s", identifier)
        raise HTTPException(
            status_code=429,
            detail=(
                f"Inference rate limit exceeded ({_MAX_REQUESTS_PER_HOUR} calls/hour). "
                f"Retry after {retry_after}s."
            ),
            headers={"Retry-After": str(retry_after)},
        )

    logger.debug(
        "Rate limit ok for %s: %d/%d remaining",
        identifier,
        result.remaining,
        _MAX_REQUESTS_PER_HOUR,
    )


def _current_unix_timestamp() -> int:
    import time
    return int(time.time())
