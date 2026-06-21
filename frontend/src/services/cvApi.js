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

export async function createShare(cvId) {
  const res = await fetch(`${BASE}/api/cv/${cvId}/share`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to create share link');
  return res.json();
}

export async function listShares(cvId) {
  const res = await fetch(`${BASE}/api/cv/${cvId}/shares`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch share links');
  return res.json();
}

export async function revokeShare(token) {
  const res = await fetch(`${BASE}/api/cv/shares/${token}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to revoke share link');
}

export async function getShareInfo(username, token) {
  const res = await fetch(`${BASE}/public/cv/${username}/${token}/info`);
  if (!res.ok) throw new Error('Link not found or expired');
  return res.json();
}

export async function setPrimary(cvId) {
  const res = await fetch(`${BASE}/api/cv/${cvId}/primary`, {
    method: 'PATCH',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to set primary CV');
  return res.json();
}

export async function listRecruiterCvs() {
  const res = await fetch(`${BASE}/public/recruiter/cvs`);
  if (!res.ok) throw new Error('Failed to fetch recruiter CVs');
  return res.json();
}

export async function downloadRecruiterCv(cvId, filename) {
  const res = await fetch(`${BASE}/public/recruiter/cv/${cvId}/download`);
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function getAdminStats() {
  const res = await fetch(`${BASE}/api/admin/stats`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function getAdminUsers() {
  const res = await fetch(`${BASE}/api/admin/users`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}
