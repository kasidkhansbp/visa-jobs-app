const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export async function getQuestions() {
  const res = await fetch(`${BASE}/api/questions`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch questions');
  return res.json();
}

export async function createQuestion(body) {
  const res = await fetch(`${BASE}/api/questions`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? 'Failed to create question');
  }
  return res.json();
}

export async function updateQuestion(id, body) {
  const res = await fetch(`${BASE}/api/questions/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? 'Failed to update question');
  }
  return res.json();
}

export async function deleteQuestion(id) {
  const res = await fetch(`${BASE}/api/questions/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete question');
}
