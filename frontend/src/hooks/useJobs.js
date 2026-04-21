import { useQuery } from "@tanstack/react-query";
import { fetchJobs } from "../services/jobsApi";

/**
 * Custom hook to fetch and cache jobs from the API.
 *
 * How it works:
 * - useQuery from React Query manages fetching, caching, and background refresh
 * - queryKey includes filters so each unique filter combination is cached separately
 * - staleTime: 5 minutes — cached data is used instantly, refetch happens in background
 * - Returns jobs, loading state, and error state for the component to use
 *
 * @param {Object} filters - optional filter params passed to the API
 */
export function useJobs(filters = {}) {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => fetchJobs(filters),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev ?? [],
  });
}
