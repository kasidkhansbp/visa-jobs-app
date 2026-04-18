"""
Tests for scheduler._store().

DB session is mocked — no real PostgreSQL needed.
"""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from scheduler import _store


@pytest.mark.asyncio
async def test_store_inserts_jobs():
    """_store() should execute an insert statement and commit."""
    mock_session = AsyncMock()
    mock_session_ctx = AsyncMock()
    mock_session_ctx.__aenter__ = AsyncMock(return_value=mock_session)
    mock_session_ctx.__aexit__ = AsyncMock(return_value=False)

    with patch("scheduler.AsyncSessionLocal", return_value=mock_session_ctx):
        from tests.conftest import REED_SINGLE_PAGE_RESPONSE
        from models.job import JobListing

        jobs = [
            JobListing(
                source="reed",
                job_id="1001",
                title="Technical Program Manager",
                employer_name="Acme Corp",
                location="London",
                description="Lead technical programs.",
                url="https://www.reed.co.uk/jobs/1001",
            )
        ]

        await _store(jobs)

    mock_session.execute.assert_called_once()
    mock_session.commit.assert_called_once()


@pytest.mark.asyncio
async def test_store_skips_empty_list():
    """_store() should do nothing when given an empty list."""
    with patch("scheduler.AsyncSessionLocal") as mock_session_local:
        await _store([])

    mock_session_local.assert_not_called()


@pytest.mark.asyncio
async def test_store_handles_multiple_jobs():
    """_store() should handle a batch of jobs in a single insert."""
    mock_session = AsyncMock()
    mock_session_ctx = AsyncMock()
    mock_session_ctx.__aenter__ = AsyncMock(return_value=mock_session)
    mock_session_ctx.__aexit__ = AsyncMock(return_value=False)

    with patch("scheduler.AsyncSessionLocal", return_value=mock_session_ctx):
        from models.job import JobListing

        jobs = [
            JobListing(
                source="reed",
                job_id=str(i),
                title=f"TPM {i}",
                employer_name="Corp",
                location="London",
                description="desc",
                url=f"https://reed.co.uk/jobs/{i}",
            )
            for i in range(10)
        ]

        await _store(jobs)

    # Only one execute call — all rows in a single INSERT
    mock_session.execute.assert_called_once()
    mock_session.commit.assert_called_once()
