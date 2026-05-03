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

export function openLoginPopup(onSuccess) {
  const popup = window.open(
    loginUrl(),
    'google-auth',
    'width=520,height=680,left=400,top=100',
  );

  const timer = setInterval(() => {
    try {
      if (!popup || popup.closed) {
        clearInterval(timer);
        return;
      }
      if (popup.location.href.includes('auth=success')) {
        clearInterval(timer);
        popup.close();
        onSuccess();
      }
    } catch {
      // cross-origin while on Google — ignore
    }
  }, 500);
}

export async function logout() {
  await fetch(`${BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
}
