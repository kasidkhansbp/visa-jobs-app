const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

/**
 * Fetch jobs from the gateway API.
 *
 * How it works:
 * - Builds a URL with optional query params (source, title, location, posted_from, posted_to)
 * - Makes a GET request to /api/jobs
 * - Returns the parsed JSON array of jobs
 *
 * @param {Object} filters - optional filter params
 * @returns {Promise<Array>} list of job objects
 */
export async function fetchJobs(filters = {}) {
  const params = new URLSearchParams();

  if (filters.source)        params.set("source", filters.source);
  if (filters.title)         params.set("title", filters.title);
  if (filters.location)      params.set("location", filters.location);
  if (filters.posted_from)   params.set("posted_from", filters.posted_from);
  if (filters.posted_to)     params.set("posted_to", filters.posted_to);
  if (filters.contract_type)   params.set("contract_type", filters.contract_type);
  if (filters.job_type)        params.set("job_type", filters.job_type);
  if (filters.sponsor_verified)  params.set("sponsor_verified", "true");
  if (filters.frequent_sponsor)  params.set("frequent_sponsor", "true");

  params.set("limit", filters.limit ?? 50);
  params.set("offset", filters.offset ?? 0);

  const response = await fetch(`${API_BASE}/api/jobs?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch jobs: ${response.status}`);
  }

  return response.json();
}

/**
 * Delete a job by its UUID.
 *
 * @param {string} jobId - UUID of the job to delete
 */
export async function deleteJob(jobId) {
  const response = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete job: ${response.status}`);
  }
}
