import { useQuery } from '@tanstack/react-query';
import { fetchSponsorStats, fetchSponsors } from '../services/sponsorsApi';

export function useSponsorStats() {
  return useQuery({
    queryKey: ['sponsor-stats'],
    queryFn: fetchSponsorStats,
    staleTime: 60 * 60 * 1000, // 1 hour — data only changes on ingestion
  });
}

export function useSponsors(filters = {}) {
  return useQuery({
    queryKey: ['sponsors', filters],
    queryFn: () => fetchSponsors(filters),
    staleTime: 5 * 60 * 1000,
    placeholderData: { total: 0, page: 1, page_size: 20, results: [] },
  });
}
