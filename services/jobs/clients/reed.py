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
_MAX_REQUESTS = 249


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
        request_count = 0

        async with httpx.AsyncClient(timeout=30.0) as client:
            for keyword in keywords:
                if request_count >= _MAX_REQUESTS:
                    logger.warning("Reed: request limit of %d reached, stopping early", _MAX_REQUESTS)
                    break
                jobs, request_count = await self._fetch_keyword(client, keyword, location, seen, request_count)
                results.extend(jobs)

        logger.info("Reed: fetched %d jobs across %d keywords in %d requests", len(results), len(keywords), request_count)
        return results

    async def _fetch_keyword(
        self,
        client: httpx.AsyncClient,
        keyword: str,
        location: str,
        seen: set[int],
        request_count: int,
    ) -> tuple[list[JobListing], int]:
        results: list[JobListing] = []
        skip = 0

        while True:
            if request_count >= _MAX_REQUESTS:
                logger.warning("Reed: request limit reached mid-keyword, stopping pagination")
                break

            params = {
                "keywords": keyword,
                "locationName": location,
                "resultsToTake": _PAGE_SIZE,
                "resultsToSkip": skip,
            }

            response = await client.get(_BASE_URL, params=params, auth=self._auth)
            response.raise_for_status()
            request_count += 1

            data = ReedSearchResponse.model_validate(response.json())

            for job in data.results:
                if job.jobId not in seen:
                    seen.add(job.jobId)
                    results.append(_to_job_listing(job))

            logger.debug(
                "Reed keyword=%r skip=%d page_results=%d total=%d requests=%d",
                keyword, skip, len(data.results), data.totalResults, request_count,
            )

            if len(data.results) < _PAGE_SIZE:
                break

            skip += _PAGE_SIZE

        return results, request_count


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
