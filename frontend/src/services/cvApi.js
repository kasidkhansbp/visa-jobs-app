const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export async function listCvs() {
  const res = await fetch(`${BASE}/api/cv`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch CVs');
  return res.json();
}

export async function uploadCv(label, file) {
  const form = new FormData();
  form.append('label', label);
  form.append('file', file);
  const res = await fetch(`${BASE}/api/cv`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? 'Upload failed');
  }
  return res.json();
}

export async function downloadCv(cvId, filename) {
  const res = await fetch(`${BASE}/api/cv/${cvId}/download`, { credentials: 'include' });
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function renameCv(cvId, label) {
  const form = new FormData();
  form.append('label', label);
  const res = await fetch(`${BASE}/api/cv/${cvId}`, {
    method: 'PATCH',
    credentials: 'include',
    body: form,
  });
  if (!res.ok) throw new Error('Rename failed');
  return res.json();
}

export async function deleteCv(cvId) {
  const res = await fetch(`${BASE}/api/cv/${cvId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Delete failed');
}
