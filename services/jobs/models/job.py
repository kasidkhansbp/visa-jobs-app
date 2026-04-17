from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, HttpUrl


class JobListing(BaseModel):
    """Normalised job listing — common shape regardless of source API."""

    source: str  # "reed" | "adzuna"
    job_id: str
    title: str
    employer_name: str
    location: str
    description: str
    url: str

    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    contract_type: Optional[str] = None  # e.g. "permanent", "contract"
    job_type: Optional[str] = None       # e.g. "full_time", "part_time"
    created_at: Optional[datetime] = None
