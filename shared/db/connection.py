from __future__ import annotations

import os
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

# Engine and session factory are created lazily on first use.
# This avoids reading DATABASE_URL at import time — the calling
# service (gateway or jobs) sets it in os.environ before any
# DB operation is triggered.
_engine = None
_session_factory = None


def _build_url() -> str:
    url = os.environ["DATABASE_URL"]
    # Railway provides postgres:// — SQLAlchemy needs postgresql+asyncpg://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    # asyncpg doesn't understand sslmode= — strip it to avoid silent hangs
    import re
    url = re.sub(r"[?&]sslmode=[^&]*", "", url).rstrip("?")
    return url


def _get_session_factory() -> async_sessionmaker:
    """
    Returns the session factory, creating the engine on first call.

    How it works:
    - First call: DATABASE_URL is read, engine is created, factory is cached
    - Subsequent calls: cached factory is returned immediately
    - This ensures DATABASE_URL is set before the engine is built
    """
    global _engine, _session_factory

    if _session_factory is None:
        _engine = create_async_engine(
            _build_url(),
            echo=False,
            pool_size=5,
            max_overflow=10,
        )
        _session_factory = async_sessionmaker(_engine, expire_on_commit=False)

    return _session_factory


# Kept for backwards compatibility with scheduler.py
def _make_session_local() -> async_sessionmaker:
    return _get_session_factory()


class AsyncSessionLocal:
    """
    Proxy that creates the real session factory lazily.
    Allows: async with AsyncSessionLocal() as session: ...
    """
    def __new__(cls) -> AsyncSession:  # type: ignore[misc]
        return _get_session_factory()()


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency-injectable async DB session for FastAPI.

    Usage:
        async def my_route(db: AsyncSession = Depends(get_session)): ...
    """
    async with _get_session_factory()() as session:
        yield session
