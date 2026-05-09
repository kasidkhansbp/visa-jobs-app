import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStories } from '../context/StoriesContext';

const NAV_ITEMS = [
  { path: '/jobs',      label: 'Jobs' },
  { path: '/sponsors',  label: 'Sponsors' },
  { path: '/sources',   label: 'Sources' },
  { path: '/resources', label: 'Resources' },
  { path: '/cv',        label: 'CV Box' },
  { path: '/stories',   label: 'Stories' },
  { path: '/insights',  label: 'Market Insights' },
  { path: '/about',     label: 'About' },
];

const TRACKER_ALLOWLIST = ['kasidkhan@gmail.com', 'kasidkhan@tpmguild.com', 'abhaykhetlani066@gmail.com'];

const GOOGLE_SVG = (
  <svg width="16" height="16" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

export default function Nav() {
  const { pathname } = useLocation();
  const { user, login, logout } = useAuth();
  const { clearCache } = useStories();
  const [open, setOpen] = useState(false);

  function handleLogout() { clearCache(); logout(); }
  const close = () => setOpen(false);
  const isActive = p => pathname === p || (p === '/jobs' && pathname === '/');

  return (
    <>
      <header className="nav">
        <Link className="brand" to="/jobs" onClick={close}>
          <img src="/logo-mark.svg" alt="TPMguild"/>
          <span>TPMguild</span>
        </Link>

        {/* Desktop links */}
        <nav className="menu">
          {NAV_ITEMS.map(i => (
            <Link key={i.path} to={i.path} className={isActive(i.path) ? 'active' : ''}>{i.label}</Link>
          ))}
          {user && <Link to="/tracker" className={pathname === '/tracker' ? 'active' : ''}>Tracker</Link>}
          {user?.email === 'kasidkhan@gmail.com' && <Link to="/admin" className={pathname === '/admin' ? 'active' : ''}>Admin</Link>}
        </nav>

        <div className="spacer"/>

        {/* Desktop auth */}
        <div className="nav-desktop-auth">
          {user === undefined ? null : user === null ? (
            <button onClick={login} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid var(--line)', color: 'var(--ink-2)', background: 'var(--paper)', cursor: 'pointer' }}>
              {GOOGLE_SVG} Sign in with Google
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {user.picture && <img src={user.picture} alt={user.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />}
              <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Welcome, {user.name.split(' ')[0]}</span>
              <button onClick={handleLogout} style={{ fontSize: 13, fontWeight: 500, padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid var(--line)', color: 'var(--ink-2)', background: 'var(--paper)', cursor: 'pointer' }}>Sign out</button>
            </div>
          )}
        </div>

        {/* Hamburger */}
        <button className="nav-burger" onClick={() => setOpen(o => !o)} aria-label="Menu">
          {open
            ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          }
        </button>
      </header>

      {/* Mobile menu */}
      {open && (
        <nav style={{
          position: 'fixed',
          top: 'var(--nav-h)',
          left: 0,
          right: 0,
          background: 'var(--paper)',
          borderBottom: '1px solid var(--line)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          zIndex: 9,
          display: 'flex',
          flexDirection: 'column',
          padding: '8px 0 16px',
        }}>
          {NAV_ITEMS.map(i => (
            <Link key={i.path} to={i.path} onClick={close} style={{
              padding: '12px 24px',
              fontSize: 16, fontWeight: 500,
              color: isActive(i.path) ? 'var(--ink)' : 'var(--ink-2)',
              textDecoration: 'none',
              borderBottom: '1px solid var(--line)',
              background: isActive(i.path) ? 'var(--paper-2)' : 'transparent',
            }}>{i.label}</Link>
          ))}
          {user && (
            <Link to="/tracker" onClick={close} style={{ padding: '12px 24px', fontSize: 16, fontWeight: 500, color: pathname === '/tracker' ? 'var(--ink)' : 'var(--ink-2)', textDecoration: 'none', borderBottom: '1px solid var(--line)' }}>Tracker</Link>
          )}
          {user?.email === 'kasidkhan@gmail.com' && (
            <Link to="/admin" onClick={close} style={{ padding: '12px 24px', fontSize: 16, fontWeight: 500, color: pathname === '/admin' ? 'var(--ink)' : 'var(--ink-2)', textDecoration: 'none', borderBottom: '1px solid var(--line)' }}>Admin</Link>
          )}
          <div style={{ padding: '16px 24px 0' }}>
            {user === undefined ? null : user === null ? (
              <button onClick={() => { login(); close(); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, padding: '10px 20px', borderRadius: 'var(--radius-full)', border: '1px solid var(--line)', color: 'var(--ink-2)', background: 'var(--paper)', cursor: 'pointer' }}>
                {GOOGLE_SVG} Sign in with Google
              </button>
            ) : (
              <button onClick={() => { handleLogout(); close(); }} style={{ fontSize: 14, fontWeight: 500, padding: '10px 20px', borderRadius: 'var(--radius-full)', border: '1px solid var(--line)', color: 'var(--ink-2)', background: 'var(--paper)', cursor: 'pointer' }}>
                Sign out ({user.name.split(' ')[0]})
              </button>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
