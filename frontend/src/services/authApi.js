const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export async function fetchMe() {
  const res = await fetch(`${BASE}/auth/me`, { credentials: 'include' });
  if (res.status === 401) return null;
  if (!res.ok) return null;
  return res.json();
}

export function loginUrl() {
  return `${BASE}/auth/login`;
}

export async function logout() {
  await fetch(`${BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
}
