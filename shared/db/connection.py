from __future__ import annotations

import os
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)


def _build_url() -> str:
    url = os.environ["DATABASE_URL"]
    # Railway provides postgres:// — SQLAlchemy needs postgresql+asyncpg://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


engine = create_async_engine(
    _build_url(),
    echo=False,       # set to True to log all SQL (useful for debugging)
    pool_size=5,
    max_overflow=10,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency-injectable async DB session.

    Usage in FastAPI:
        async def my_route(db: AsyncSession = Depends(get_session)): ...

    Usage in services:
        async with get_session() as db:
            ...
    """
    async with AsyncSessionLocal() as session:
        yield session
