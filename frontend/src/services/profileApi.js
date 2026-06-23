const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export async function getProfile() {
  const res = await fetch(`${BASE}/api/profile`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function updateProfile(fields) {
  const res = await fetch(`${BASE}/api/profile`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? 'Update failed');
  }
  return res.json();
}

export async function getPipeline() {
  const res = await fetch(`${BASE}/api/profile/pipeline`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch pipeline');
  return res.json();
}
