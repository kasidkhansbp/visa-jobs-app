from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import GatewayConfig
from .routers import jobs, sponsors, auth, cv, public, admin, gmail, stories, market, question_bank, profile

config = GatewayConfig()  # type: ignore[call-arg]

# Set DATABASE_URL in env so shared/db/connection.py can read it
os.environ.setdefault("DATABASE_URL", config.database_url)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


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
app.include_router(public.router)
app.include_router(admin.router)
app.include_router(gmail.router)
app.include_router(stories.router)
app.include_router(market.router)
app.include_router(question_bank.router)
app.include_router(profile.router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
