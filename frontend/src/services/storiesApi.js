const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export async function listStories() {
  const res = await fetch(`${BASE}/api/stories`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch stories');
  return res.json();
}

export async function getStory(id) {
  const res = await fetch(`${BASE}/api/stories/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch story');
  return res.json();
}

export async function createStory() {
  const res = await fetch(`${BASE}/api/stories`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to create story');
  return res.json();
}

export async function updateStory(id, patch) {
  const res = await fetch(`${BASE}/api/stories/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error('Failed to save story');
  return res.json();
}

export async function deleteStory(id) {
  const res = await fetch(`${BASE}/api/stories/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete story');
  return res.status === 200 ? res.json() : null;
}
