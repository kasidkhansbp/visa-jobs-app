const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export async function getGmailStatus() {
  const res = await fetch(`${BASE}/api/gmail/status`, { credentials: 'include' });
  if (res.status === 403) throw new Error('403');
  if (!res.ok) throw new Error('Failed to fetch Gmail status');
  return res.json();
}

export async function getGmailAuthUrl() {
  const res = await fetch(`${BASE}/api/gmail/auth-url`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to get auth URL');
  return res.json();
}

export async function disconnectGmail() {
  const res = await fetch(`${BASE}/api/gmail/disconnect`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to disconnect Gmail');
}

export async function getApplications() {
  const res = await fetch(`${BASE}/api/gmail/applications`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch applications');
  return res.json();
}
