"""FastAPI decorator for Meso SSE streams with disconnect detection."""

from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator, Callable
from functools import wraps
from typing import Any

from fastapi import Request
from fastapi.responses import StreamingResponse


def meso_sse_handler(
    route_fn: Callable[..., AsyncIterator[str]],
) -> Callable[..., Any]:
    """
    Wrap an async generator that yields SSE lines.

    - Detects client disconnect via request.is_disconnected()
    - Stops the generator early to avoid burning tokens after tab close
    - Returns a StreamingResponse with text/event-stream media type

    Usage:
        @app.post("/chat/stream")
        @meso_sse_handler
        async def chat_stream(request: Request, body: ChatBody):
            async for line in generate_meso_events(body):
                yield line
    """

    @wraps(route_fn)
    async def wrapper(request: Request, *args, **kwargs):
        async def event_stream() -> AsyncIterator[str]:
            async for chunk in route_fn(request, *args, **kwargs):
                if await request.is_disconnected():
                    break
                yield chunk
                await asyncio.sleep(0)

        return StreamingResponse(
            event_stream(),
            media_type='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no',
            },
        )

    return wrapper
