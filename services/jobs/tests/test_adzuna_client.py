"""
Tests for AdzunaClient.

All HTTP calls are mocked — no real API key needed.
"""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from clients.adzuna import AdzunaClient, _to_job_listing
from models.adzuna import AdzunaJob, AdzunaCompany, AdzunaCategory, AdzunaLocation
from models.job import JobListing
from tests.conftest import ADZUNA_SINGLE_PAGE_RESPONSE


# ── _to_job_listing ────────────────────────────────────────────────────────────

def test_to_job_listing_maps_fields_correctly():
    raw = AdzunaJob(
        id="aaa-111",
        title="Technical Program Manager",
        description="Drive engineering programmes.",
        created="2026-04-01T00:00:00Z",
        redirect_url="https://www.adzuna.co.uk/jobs/details/aaa-111",
        contract_type="permanent",
        contract_time="full_time",
        salary_min=75000.0,
        salary_max=95000.0,
        company=AdzunaCompany(display_name="Global Bank PLC"),
        category=AdzunaCategory(label="IT Jobs", tag="it-jobs"),
        location=AdzunaLocation(display_name="London", area=["UK", "London"]),
    )

    result = _to_job_listing(raw)

    assert result.source == "adzuna"
    assert result.job_id == "aaa-111"
    assert result.title == "Technical Program Manager"
    assert result.employer_name == "Global Bank PLC"
    assert result.location == "London"
    assert result.salary_min == 75000.0
    assert result.salary_max == 95000.0
    assert result.contract_type == "permanent"
    assert result.job_type == "full_time"
    assert result.url == "https://www.adzuna.co.uk/jobs/details/aaa-111"
    assert result.created_at is not None


def test_to_job_listing_handles_missing_salary():
    raw = AdzunaJob(
        id="bbb-222",
        title="Program Manager",
        description="Manage delivery.",
        created="2026-04-01T00:00:00Z",
        redirect_url="https://www.adzuna.co.uk/jobs/details/bbb-222",
        salary_min=None,
        salary_max=None,
        company=AdzunaCompany(display_name="Startup Ltd"),
        category=AdzunaCategory(label="IT Jobs", tag="it-jobs"),
        location=AdzunaLocation(display_name="London", area=["UK", "London"]),
    )

    result = _to_job_listing(raw)

    assert result.salary_min is None
    assert result.salary_max is None


def test_to_job_listing_handles_invalid_date():
    raw = AdzunaJob(
        id="ccc-333",
        title="TPM",
        description="desc",
        created="not-a-date",
        redirect_url="https://www.adzuna.co.uk/jobs/details/ccc-333",
        company=AdzunaCompany(display_name="Corp"),
        category=AdzunaCategory(label="IT Jobs", tag="it-jobs"),
        location=AdzunaLocation(display_name="London", area=[]),
    )

    result = _to_job_listing(raw)

    assert result.created_at is None


# ── AdzunaClient.fetch_all ─────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_fetch_all_returns_job_listings():
    mock_response = MagicMock()
    mock_response.json.return_value = ADZUNA_SINGLE_PAGE_RESPONSE
    mock_response.raise_for_status = MagicMock()

    with patch("clients.adzuna.httpx.AsyncClient") as mock_client_class:
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_response)
        mock_client_class.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client_class.return_value.__aexit__ = AsyncMock(return_value=False)

        client = AdzunaClient(app_id="fake-id", app_key="fake-key")
        results = await client.fetch_all(["Technical Program Manager"], "London")

    assert len(results) == 2
    assert all(isinstance(j, JobListing) for j in results)
    assert results[0].source == "adzuna"
    assert results[0].job_id == "aaa-111"


@pytest.mark.asyncio
async def test_fetch_all_deduplicates_across_keywords():
    """Same job returned for two different keywords — should only appear once."""
    mock_response = MagicMock()
    mock_response.json.return_value = ADZUNA_SINGLE_PAGE_RESPONSE
    mock_response.raise_for_status = MagicMock()

    with patch("clients.adzuna.httpx.AsyncClient") as mock_client_class:
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_response)
        mock_client_class.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client_class.return_value.__aexit__ = AsyncMock(return_value=False)

        client = AdzunaClient(app_id="fake-id", app_key="fake-key")
        results = await client.fetch_all(["TPM", "Technical Program Manager"], "London")

    assert len(results) == 2


@pytest.mark.asyncio
async def test_fetch_all_returns_empty_on_no_results():
    mock_response = MagicMock()
    mock_response.json.return_value = {"count": 0, "results": []}
    mock_response.raise_for_status = MagicMock()

    with patch("clients.adzuna.httpx.AsyncClient") as mock_client_class:
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_response)
        mock_client_class.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client_class.return_value.__aexit__ = AsyncMock(return_value=False)

        client = AdzunaClient(app_id="fake-id", app_key="fake-key")
        results = await client.fetch_all(["TPM"], "London")

    assert results == []
