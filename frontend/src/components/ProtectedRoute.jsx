import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, login } = useAuth();

  if (user === undefined) return null; // still loading

  if (user === null) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '96px 56px', textAlign: 'center' }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>SIGN IN REQUIRED</div>
        <h1 style={{ fontSize: 28, margin: '0 0 16px' }}>This page requires an account.</h1>
        <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.65, marginBottom: 32 }}>
          Sign in with your Google account to access this page. It's free.
        </p>
        <button
          onClick={login}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
            fontWeight: 500,
            padding: '10px 20px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--line)',
            color: 'var(--ink-2)',
            background: 'var(--paper)',
            cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    );
  }

  return children;
}
