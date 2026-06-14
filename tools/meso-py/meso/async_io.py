"""Run blocking callables in a thread pool from async FastAPI routes."""

from __future__ import annotations

import asyncio
from collections.abc import Callable
from typing import TypeVar

T = TypeVar('T')


async def to_thread(func: Callable[..., T], /, *args, **kwargs) -> T:
    """Async wrapper around asyncio.to_thread for blocking I/O in async routes."""
    return await asyncio.to_thread(func, *args, **kwargs)
