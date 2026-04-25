import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import { getShareInfo } from '../services/cvApi';

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function CvSharePage() {
  useSEO({ title: 'CV Share', description: 'View and download a shared CV.' });
  const { username, token } = useParams();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  const downloadUrl = `${BASE}/public/cv/${username}/${token}/download`;

  useEffect(() => {
    getShareInfo(username, token)
      .then(setInfo)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [username, token]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ fontSize: 14, color: 'var(--ink-4)' }}>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 16px', display: 'block', color: 'var(--ink-4)' }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <h2 style={{ fontSize: 22, margin: '0 0 10px' }}>Link unavailable</h2>
        <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.6 }}>
          This link has expired or been revoked by the owner.
        </p>
      </div>
    );
  }

  const isExpired = new Date(info.expires_at) < new Date();

  /* ── Mobile layout ─────────────────────────────────────────── */
  if (isMobile) {
    return (
      <div style={{ padding: '32px 20px 64px' }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>SHARED CV</div>
        <h1 style={{ fontSize: 24, margin: '0 0 6px' }}>{info.cv_label}</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: '0 0 4px' }}>
          Shared by <strong style={{ color: 'var(--ink-2)' }}>{info.owner_name}</strong>
        </p>
        <p style={{ fontSize: 12, color: isExpired ? 'var(--danger)' : 'var(--ink-4)', margin: '0 0 24px' }}>
          {isExpired ? 'This link has expired' : `Expires ${formatDate(info.expires_at)}`}
        </p>
        {!isExpired && (
          <div style={{
            border: '1px solid var(--line)', borderRadius: 'var(--radius-md)',
            padding: '24px', background: 'var(--paper-2)', textAlign: 'center',
          }}>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: '0 0 16px' }}>
              Download the file to view it on mobile.
            </p>
            <a href={downloadUrl} download style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 13, fontWeight: 500, padding: '10px 22px',
              borderRadius: 'var(--radius-full)',
              color: 'white', background: 'var(--accent)',
              textDecoration: 'none', border: '1px solid var(--accent)',
            }}>
              Download PDF
            </a>
          </div>
        )}
      </div>
    );
  }

  /* ── Desktop layout ────────────────────────────────────────── */
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      gap: 0,
      height: 'calc(100vh - var(--nav-h))',
      overflow: 'hidden',
    }}>
      {/* Left sidebar */}
      <div style={{
        borderRight: '1px solid var(--line)',
        padding: '40px 28px',
        display: 'flex', flexDirection: 'column', gap: 0,
        overflowY: 'auto',
        background: 'var(--paper)',
      }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>SHARED CV</div>
        <h2 style={{ fontSize: 22, margin: '0 0 16px', lineHeight: 1.2 }}>{info.cv_label}</h2>

        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 4 }}>Shared by</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 20 }}>{info.owner_name}</div>

        <div style={{
          padding: '12px 14px',
          background: isExpired ? '#fff0ef' : 'var(--verified-wash)',
          borderRadius: 'var(--radius)',
          marginBottom: 28,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: isExpired ? 'var(--danger)' : 'var(--verified)', marginBottom: 2 }}>
            {isExpired ? 'Expired' : 'Active'}
          </div>
          <div style={{ fontSize: 13, color: isExpired ? 'var(--danger)' : 'var(--verified)' }}>
            {isExpired ? 'This link has expired' : `Expires ${formatDate(info.expires_at)}`}
          </div>
        </div>

        {!isExpired && (
          <a
            href={downloadUrl}
            download
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 14, fontWeight: 500, padding: '11px 0',
              borderRadius: 'var(--radius-full)',
              color: 'white', background: 'var(--accent)',
              textDecoration: 'none', border: '1px solid var(--accent)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Download PDF
          </a>
        )}

        <div style={{ flex: 1 }} />

        <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 32 }}>
          Shared via <strong style={{ color: 'var(--ink-3)' }}>TPMguild</strong>
        </div>
      </div>

      {/* Right — PDF viewer */}
      <div style={{ background: '#525659', overflow: 'hidden' }}>
        {isExpired ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <p style={{ color: '#ccc', fontSize: 14 }}>This link has expired.</p>
          </div>
        ) : (
          <iframe
            src={downloadUrl}
            title={info.cv_label}
            width="100%"
            height="100%"
            style={{ display: 'block', border: 'none' }}
          />
        )}
      </div>
    </div>
  );
}
