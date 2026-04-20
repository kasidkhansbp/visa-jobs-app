from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI

from .config import GatewayConfig
from .routers import jobs

config = GatewayConfig()  # type: ignore[call-arg]

# Set DATABASE_URL in env so shared/db/connection.py can read it
os.environ.setdefault("DATABASE_URL", config.database_url)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield  # auth hooks go here later


app = FastAPI(
    title="Visa Jobs Gateway",
    lifespan=lifespan,
    docs_url="/docs" if config.debug else None,  # disable swagger in production
)

app.include_router(jobs.router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
