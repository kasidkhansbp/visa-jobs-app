import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import { useAuth } from '../context/AuthContext';
import { loginUrl } from '../services/authApi';
import { getGmailStatus, getGmailAuthUrl, disconnectGmail, getApplications } from '../services/trackerApi';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_CONFIG = {
  applied:              { label: 'Applied',             bg: 'var(--accent-wash)',   color: 'var(--accent)' },
  interview_scheduled:  { label: 'Interview',           bg: 'var(--verified-wash)', color: 'var(--verified)' },
  rejected:             { label: 'Rejected',            bg: '#fff0ef',              color: 'var(--danger)' },
  offer_received:       { label: 'Offer Received',      bg: '#f0fdf4',              color: '#16a34a' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: 'var(--paper-2)', color: 'var(--ink-3)' };
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
      textTransform: 'uppercase', padding: '3px 10px',
      borderRadius: 'var(--radius-full)',
      background: cfg.bg, color: cfg.color,
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}

function ApplicationCard({ app }) {
  return (
    <div style={{
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      padding: '16px 20px',
      background: 'var(--paper)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{app.company}</div>
        <StatusBadge status={app.status} />
      </div>
      {app.roles.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
          {app.roles.map((role, i) => (
            <span key={i} style={{
              fontSize: 11, padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--line)',
              color: 'var(--ink-3)', background: 'var(--paper-2)',
            }}>
              {role}
            </span>
          ))}
        </div>
      )}
      <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>
        Applied {formatDate(app.applied_at ?? app.last_email_at ?? app.created_at)}
      </div>
    </div>
  );
}

function GmailConnectBanner({ onConnect, connecting }) {
  return (
    <div style={{
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      padding: '32px 28px',
      background: 'var(--paper-2)',
      textAlign: 'center',
      marginBottom: 32,
    }}>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 14px', display: 'block', color: 'var(--ink-4)' }}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
        Connect your Gmail
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink-4)', margin: '0 0 20px', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
        Allow TPMguild to monitor your inbox for job application emails. Read-only access — we never send or delete emails.
      </p>
      <button
        onClick={onConnect}
        disabled={connecting}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontSize: 13, fontWeight: 500, padding: '9px 20px',
          borderRadius: 'var(--radius-full)', border: '1px solid var(--line)',
          color: 'var(--ink-2)', background: 'var(--paper)', cursor: 'pointer',
          opacity: connecting ? 0.5 : 1,
        }}
      >
        {connecting ? 'Redirecting…' : 'Connect Gmail'}
      </button>
    </div>
  );
}

export default function TrackerPage() {
  useSEO({ title: 'Job Tracker', description: 'Track your job applications automatically via Gmail.' });
  const { user } = useAuth();
  const location = useLocation();

  const [gmailStatus, setGmailStatus] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [notAllowed, setNotAllowed] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    Promise.all([getGmailStatus(), getApplications()])
      .then(([status, apps]) => { setGmailStatus(status); setApplications(apps); })
      .catch(err => { if (err.message?.includes('403')) setNotAllowed(true); })
      .finally(() => setLoading(false));
  }, [user]);

  // Refresh after Gmail OAuth callback
  useEffect(() => {
    if (location.search.includes('gmail=connected')) {
      getGmailStatus().then(setGmailStatus);
      getApplications().then(setApplications);
    }
  }, [location.search]);

  async function handleConnect() {
    setConnecting(true);
    try {
      const { url } = await getGmailAuthUrl();

      const popup = window.open(url, 'gmail-auth', 'width=520,height=680,left=400,top=100');

      // Poll popup until it redirects back to our tracker page
      const timer = setInterval(async () => {
        try {
          if (!popup || popup.closed) {
            clearInterval(timer);
            setConnecting(false);
            return;
          }
          const popupUrl = popup.location.href;
          if (popupUrl.includes('/tracker')) {
            clearInterval(timer);
            popup.close();
            // Refresh status and applications
            const [status, apps] = await Promise.all([getGmailStatus(), getApplications()]);
            setGmailStatus(status);
            setApplications(apps);
            setConnecting(false);
          }
        } catch {
          // Cross-origin error while popup is on Google — ignore and keep polling
        }
      }, 500);

    } catch {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      await disconnectGmail();
      setGmailStatus({ connected: false, last_checked_at: null });
      setApplications([]);
    } catch {
    } finally {
      setDisconnecting(false);
    }
  }

  if (user === undefined) return null;

  if (notAllowed) {
    return (
      <div style={{ maxWidth: 480, margin: '96px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
          Coming soon
        </div>
        <p style={{ fontSize: 14, color: 'var(--ink-4)', lineHeight: 1.6 }}>
          The Job Tracker is currently in early access. It will be available to all users soon.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '64px var(--s-9) 96px' }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>JOB TRACKER</div>
        <h1 style={{ margin: '0 0 8px' }}>Track your applications.</h1>
        <p style={{ fontSize: 15, color: 'var(--ink-3)', marginBottom: 40 }}>
          Sign in to connect Gmail and automatically track your job applications.
        </p>
        <a href={loginUrl()} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontSize: 13, fontWeight: 500, padding: '9px 20px',
          borderRadius: 'var(--radius-full)', border: '1px solid var(--line)',
          color: 'var(--ink-2)', textDecoration: 'none', background: 'var(--paper)',
        }}>
          Sign in with Google
        </a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '64px var(--s-9) 96px' }}>
      <div className="eyebrow" style={{ marginBottom: 10 }}>JOB TRACKER</div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ margin: 0 }}>Your applications.</h1>
        {gmailStatus?.connected && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--verified)' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--verified)' }} />
              Gmail connected
              {gmailStatus.last_checked_at && (
                <span style={{ color: 'var(--ink-4)' }}>· Last checked {formatDate(gmailStatus.last_checked_at)}</span>
              )}
            </div>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              style={{
                fontSize: 12, padding: '4px 12px',
                borderRadius: 'var(--radius-full)', border: '1px solid var(--line)',
                color: 'var(--ink-4)', background: 'var(--paper)', cursor: 'pointer',
              }}
            >
              {disconnecting ? 'Disconnecting…' : 'Disconnect'}
            </button>
          </div>
        )}
      </div>
      <p style={{ fontSize: 15, color: 'var(--ink-3)', marginBottom: 16 }}>
        Automatically tracked from your Gmail inbox.
      </p>
      <p style={{ fontSize: 14, color: 'var(--ink-4)', lineHeight: 1.7, marginBottom: 40, maxWidth: 580 }}>
        Connect your Gmail and the agent monitors your inbox hourly. When it detects a job application confirmation,
        interview invite, or rejection, it automatically creates or updates a record here — no manual input needed.
      </p>

      {loading ? (
        <p style={{ fontSize: 14, color: 'var(--ink-4)' }}>Loading…</p>
      ) : (
        <>
          {!gmailStatus?.connected && (
            <GmailConnectBanner onConnect={handleConnect} connecting={connecting} />
          )}

          {applications.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '52px 24px',
              border: '1px dashed var(--line-2)', borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>
                No applications tracked yet
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-4)' }}>
                {gmailStatus?.connected
                  ? 'The agent checks your inbox hourly. Applications will appear here automatically.'
                  : 'Connect Gmail above to start tracking your applications.'}
              </div>
            </div>
          ) : (() => {
            const TABS = [
              { key: 'all', label: 'All' },
              { key: 'applied', label: 'Applied' },
              { key: 'interview_scheduled', label: 'Interview' },
              { key: 'rejected', label: 'Rejected' },
              { key: 'offer_received', label: 'Offer' },
            ];
            const filtered = activeTab === 'all'
              ? applications
              : applications.filter(a => a.status === activeTab);

            return (
              <>
                <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
                  {TABS.map(tab => {
                    const count = tab.key === 'all'
                      ? applications.length
                      : applications.filter(a => a.status === tab.key).length;
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                          fontSize: 12, fontWeight: 500,
                          padding: '5px 14px',
                          borderRadius: 'var(--radius-full)',
                          border: `1px solid ${isActive ? 'var(--accent)' : 'var(--line)'}`,
                          color: isActive ? 'var(--accent)' : 'var(--ink-3)',
                          background: isActive ? 'var(--accent-wash)' : 'var(--paper)',
                          cursor: 'pointer',
                        }}
                      >
                        {tab.label} {count > 0 && <span style={{ opacity: 0.7 }}>({count})</span>}
                      </button>
                    );
                  })}
                </div>
                {filtered.length === 0 ? (
                  <div style={{
                    textAlign: 'center', padding: '40px 24px',
                    border: '1px dashed var(--line-2)', borderRadius: 'var(--radius-md)',
                    fontSize: 13, color: 'var(--ink-4)',
                  }}>
                    No {activeTab === 'all' ? '' : activeTab.replace('_', ' ')} applications.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {filtered.map(app => (
                      <ApplicationCard key={app.id} app={app} />
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </>
      )}
    </div>
  );
}
