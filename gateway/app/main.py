from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import GatewayConfig
from .routers import jobs, sponsors, auth, cv

config = GatewayConfig()  # type: ignore[call-arg]

# Set DATABASE_URL in env so shared/db/connection.py can read it
os.environ.setdefault("DATABASE_URL", config.database_url)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield  # auth hooks go here later


app = FastAPI(
    title="Visa Jobs Gateway",
    lifespan=lifespan,
    docs_url="/docs" if config.debug else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[config.frontend_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(sponsors.router)
app.include_router(cv.router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
