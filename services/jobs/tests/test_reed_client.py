"""
Tests for ReedClient.

All HTTP calls are mocked — no real API key needed.
"""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from clients.reed import ReedClient, _to_job_listing
from models.job import JobListing
from models.reed import ReedJob
from tests.conftest import REED_SINGLE_PAGE_RESPONSE


# ── _to_job_listing ────────────────────────────────────────────────────────────

def test_to_job_listing_maps_fields_correctly():
    raw = ReedJob(
        jobId=1001,
        employerId=501,
        employerName="Acme Corp",
        jobTitle="Technical Program Manager",
        locationName="London",
        minimumSalary=70000.0,
        maximumSalary=90000.0,
        jobDescription="Lead technical programs.",
        jobUrl="https://www.reed.co.uk/jobs/1001",
        date="2026-04-01T00:00:00",
    )

    result = _to_job_listing(raw)

    assert result.source == "reed"
    assert result.job_id == "1001"
    assert result.title == "Technical Program Manager"
    assert result.employer_name == "Acme Corp"
    assert result.location == "London"
    assert result.salary_min == 70000.0
    assert result.salary_max == 90000.0
    assert result.url == "https://www.reed.co.uk/jobs/1001"
    assert result.created_at is not None


def test_to_job_listing_handles_missing_salary():
    raw = ReedJob(
        jobId=1002,
        employerId=502,
        employerName="TechCo",
        jobTitle="Program Manager",
        locationName="London",
        minimumSalary=None,
        maximumSalary=None,
        jobDescription="Manage delivery.",
        jobUrl="https://www.reed.co.uk/jobs/1002",
    )

    result = _to_job_listing(raw)

    assert result.salary_min is None
    assert result.salary_max is None


def test_to_job_listing_handles_invalid_date():
    raw = ReedJob(
        jobId=1003,
        employerId=503,
        employerName="Corp",
        jobTitle="TPM",
        locationName="London",
        jobDescription="desc",
        jobUrl="https://www.reed.co.uk/jobs/1003",
        date="not-a-date",
    )

    result = _to_job_listing(raw)

    assert result.created_at is None


# ── ReedClient.fetch_all ───────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_fetch_all_returns_job_listings():
    mock_response = MagicMock()
    mock_response.json.return_value = REED_SINGLE_PAGE_RESPONSE
    mock_response.raise_for_status = MagicMock()

    with patch("clients.reed.httpx.AsyncClient") as mock_client_class:
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_response)
        mock_client_class.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client_class.return_value.__aexit__ = AsyncMock(return_value=False)

        client = ReedClient(api_key="fake-key")
        results = await client.fetch_all(["Technical Program Manager"], "London")

    assert len(results) == 2
    assert all(isinstance(j, JobListing) for j in results)
    assert results[0].source == "reed"
    assert results[0].job_id == "1001"


@pytest.mark.asyncio
async def test_fetch_all_deduplicates_across_keywords():
    """Same job returned for two different keywords — should only appear once."""
    mock_response = MagicMock()
    mock_response.json.return_value = REED_SINGLE_PAGE_RESPONSE
    mock_response.raise_for_status = MagicMock()

    with patch("clients.reed.httpx.AsyncClient") as mock_client_class:
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_response)
        mock_client_class.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client_class.return_value.__aexit__ = AsyncMock(return_value=False)

        client = ReedClient(api_key="fake-key")
        results = await client.fetch_all(["TPM", "Technical Program Manager"], "London")

    # 2 unique jobs despite 2 keywords returning the same results
    assert len(results) == 2


@pytest.mark.asyncio
async def test_fetch_all_returns_empty_on_no_results():
    mock_response = MagicMock()
    mock_response.json.return_value = {"totalResults": 0, "results": []}
    mock_response.raise_for_status = MagicMock()

    with patch("clients.reed.httpx.AsyncClient") as mock_client_class:
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_response)
        mock_client_class.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client_class.return_value.__aexit__ = AsyncMock(return_value=False)

        client = ReedClient(api_key="fake-key")
        results = await client.fetch_all(["TPM"], "London")

    assert results == []
