const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export async function getMarketSummary() {
  const res = await fetch(`${BASE}/api/market/summary`);
  if (!res.ok) throw new Error('Failed to fetch market summary');
  return res.json();
}

export async function getMarketHeatmap() {
  const res = await fetch(`${BASE}/api/market/heatmap`);
  if (!res.ok) throw new Error('Failed to fetch market heatmap');
  return res.json();
}
