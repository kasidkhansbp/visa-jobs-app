from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class ReedJob(BaseModel):
    """Raw job object returned by Reed search endpoint."""

    jobId: int
    employerId: int
    employerName: str
    employerProfileId: Optional[int] = None
    jobTitle: str
    locationName: str
    minimumSalary: Optional[float] = None
    maximumSalary: Optional[float] = None
    currency: Optional[str] = None
    expirationDate: Optional[str] = None
    date: Optional[str] = None
    jobDescription: str
    applications: Optional[int] = None
    jobUrl: str


class ReedSearchResponse(BaseModel):
    """Envelope returned by Reed /search endpoint."""

    totalResults: int
    results: list[ReedJob]
