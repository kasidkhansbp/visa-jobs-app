from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class AdzunaCompany(BaseModel):
    display_name: Optional[str] = None


class AdzunaCategory(BaseModel):
    label: str
    tag: str


class AdzunaLocation(BaseModel):
    display_name: str
    area: list[str] = []


class AdzunaJob(BaseModel):
    """Raw job object returned by Adzuna search endpoint."""

    id: str
    title: str
    description: str
    created: str  # ISO 8601 timestamp
    redirect_url: str
    company: AdzunaCompany
    location: AdzunaLocation
    category: AdzunaCategory

    contract_type: Optional[str] = None   # e.g. "permanent"
    contract_time: Optional[str] = None   # e.g. "full_time"
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_is_predicted: Optional[int] = None  # 0 or 1
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class AdzunaSearchResponse(BaseModel):
    """Envelope returned by Adzuna /search endpoint."""

    count: int
    results: list[AdzunaJob]
