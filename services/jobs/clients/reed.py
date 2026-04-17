from __future__ import annotations

import logging
from datetime import datetime, timezone

import httpx

from ..models.job import JobListing
from ..models.reed import ReedJob, ReedSearchResponse
from .base import BaseJobClient

logger = logging.getLogger(__name__)

_BASE_URL = "https://www.reed.co.uk/api/1.0/search"
_PAGE_SIZE = 100  # Reed max per request


class ReedClient(BaseJobClient):
    """
    Async client for the Reed Jobs API.

    Auth: HTTP Basic — API key as username, empty password.
    Docs: https://www.reed.co.uk/developers/jobseeker
    """

    def __init__(self, api_key: str) -> None:
        self._auth = (api_key, "")

    async def fetch_all(
        self,
        keywords: list[str],
        location: str,
    ) -> list[JobListing]:
        """Fetch all pages for every keyword and return deduplicated results."""
        seen: set[int] = set()
        results: list[JobListing] = []

        async with httpx.AsyncClient(timeout=30.0) as client:
            for keyword in keywords:
                jobs = await self._fetch_keyword(client, keyword, location, seen)
                results.extend(jobs)

        logger.info("Reed: fetched %d jobs across %d keywords", len(results), len(keywords))
        return results

    async def _fetch_keyword(
        self,
        client: httpx.AsyncClient,
        keyword: str,
        location: str,
        seen: set[int],
    ) -> list[JobListing]:
        results: list[JobListing] = []
        skip = 0

        while True:
            params = {
                "keywords": keyword,
                "locationName": location,
                "resultsToTake": _PAGE_SIZE,
                "resultsToSkip": skip,
            }

            response = await client.get(_BASE_URL, params=params, auth=self._auth)
            response.raise_for_status()

            data = ReedSearchResponse.model_validate(response.json())

            for job in data.results:
                if job.jobId not in seen:
                    seen.add(job.jobId)
                    results.append(_to_job_listing(job))

            logger.debug(
                "Reed keyword=%r skip=%d page_results=%d total=%d",
                keyword, skip, len(data.results), data.totalResults,
            )

            if len(data.results) < _PAGE_SIZE:
                break

            skip += _PAGE_SIZE

        return results


def _to_job_listing(job: ReedJob) -> JobListing:
    created_at: datetime | None = None
    if job.date:
        try:
            created_at = datetime.fromisoformat(job.date).replace(tzinfo=timezone.utc)
        except ValueError:
            pass

    return JobListing(
        source="reed",
        job_id=str(job.jobId),
        title=job.jobTitle,
        employer_name=job.employerName,
        location=job.locationName,
        description=job.jobDescription,
        url=job.jobUrl,
        salary_min=job.minimumSalary,
        salary_max=job.maximumSalary,
        created_at=created_at,
    )
