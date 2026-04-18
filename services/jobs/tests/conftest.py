"""
Shared fixtures for all tests.
"""
from __future__ import annotations

import pytest

from models.job import JobListing


# ── Fake API responses ─────────────────────────────────────────────────────────

REED_SINGLE_PAGE_RESPONSE = {
    "totalResults": 2,
    "results": [
        {
            "jobId": 1001,
            "employerId": 501,
            "employerName": "Acme Corp",
            "employerProfileId": None,
            "jobTitle": "Technical Program Manager",
            "locationName": "London",
            "minimumSalary": 70000.0,
            "maximumSalary": 90000.0,
            "currency": "GBP",
            "expirationDate": "2026-05-01",
            "date": "2026-04-01T00:00:00",
            "jobDescription": "Lead technical programs across engineering teams.",
            "applications": 10,
            "jobUrl": "https://www.reed.co.uk/jobs/tpm/1001",
        },
        {
            "jobId": 1002,
            "employerId": 502,
            "employerName": "TechCo Ltd",
            "employerProfileId": None,
            "jobTitle": "Program Manager",
            "locationName": "London",
            "minimumSalary": 60000.0,
            "maximumSalary": 80000.0,
            "currency": "GBP",
            "expirationDate": "2026-05-10",
            "date": "2026-04-02T00:00:00",
            "jobDescription": "Manage delivery across multiple squads.",
            "applications": 5,
            "jobUrl": "https://www.reed.co.uk/jobs/pm/1002",
        },
    ],
}

ADZUNA_SINGLE_PAGE_RESPONSE = {
    "count": 2,
    "results": [
        {
            "id": "aaa-111",
            "title": "Technical Program Manager",
            "description": "Drive engineering programmes at scale.",
            "created": "2026-04-01T00:00:00Z",
            "redirect_url": "https://www.adzuna.co.uk/jobs/details/aaa-111",
            "contract_type": "permanent",
            "contract_time": "full_time",
            "salary_min": 75000.0,
            "salary_max": 95000.0,
            "salary_is_predicted": 0,
            "latitude": 51.5074,
            "longitude": -0.1278,
            "company": {"display_name": "Global Bank PLC"},
            "category": {"label": "IT Jobs", "tag": "it-jobs"},
            "location": {"display_name": "London", "area": ["UK", "London"]},
        },
        {
            "id": "bbb-222",
            "title": "Engineering Program Manager",
            "description": "Own the delivery roadmap for the platform team.",
            "created": "2026-04-03T00:00:00Z",
            "redirect_url": "https://www.adzuna.co.uk/jobs/details/bbb-222",
            "contract_type": "permanent",
            "contract_time": "full_time",
            "salary_min": 65000.0,
            "salary_max": 85000.0,
            "salary_is_predicted": 0,
            "latitude": 51.5074,
            "longitude": -0.1278,
            "company": {"display_name": "Startup Ltd"},
            "category": {"label": "IT Jobs", "tag": "it-jobs"},
            "location": {"display_name": "London", "area": ["UK", "London"]},
        },
    ],
}


# ── Reusable JobListing fixtures ───────────────────────────────────────────────

@pytest.fixture
def reed_job() -> JobListing:
    return JobListing(
        source="reed",
        job_id="1001",
        title="Technical Program Manager",
        employer_name="Acme Corp",
        location="London",
        description="Lead technical programs across engineering teams.",
        url="https://www.reed.co.uk/jobs/tpm/1001",
        salary_min=70000.0,
        salary_max=90000.0,
    )


@pytest.fixture
def adzuna_job() -> JobListing:
    return JobListing(
        source="adzuna",
        job_id="aaa-111",
        title="Technical Program Manager",
        employer_name="Global Bank PLC",
        location="London",
        description="Drive engineering programmes at scale.",
        url="https://www.adzuna.co.uk/jobs/details/aaa-111",
        salary_min=75000.0,
        salary_max=95000.0,
        contract_type="permanent",
        job_type="full_time",
    )


@pytest.fixture
def sample_jobs(reed_job: JobListing, adzuna_job: JobListing) -> list[JobListing]:
    return [reed_job, adzuna_job]
