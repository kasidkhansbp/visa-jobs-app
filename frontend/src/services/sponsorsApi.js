const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export async function fetchSponsorStats() {
  const res = await fetch(`${API_BASE}/api/sponsors/stats`);
  if (!res.ok) throw new Error(`Failed to fetch sponsor stats: ${res.status}`);
  return res.json();
}

export async function fetchSponsors({ q, route, rating, min_routes, page, pageSize } = {}) {
  const params = new URLSearchParams();
  if (q)          params.set('q', q);
  if (route)      params.set('route', route);
  if (rating)     params.set('rating', rating);
  if (min_routes) params.set('min_routes', min_routes);
  if (page)       params.set('page', page);
  if (pageSize)   params.set('page_size', pageSize);

  const res = await fetch(`${API_BASE}/api/sponsors?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch sponsors: ${res.status}`);
  return res.json();
}
