import { useState, useEffect } from 'react';
import useSEO from '../hooks/useSEO';
import { useAuth } from '../context/AuthContext';
import { listRecruiterCvs, downloadRecruiterCv } from '../services/cvApi';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function RecruiterCvCard({ cv }) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadRecruiterCv(cv.id, `${cv.owner_name} - ${cv.label}.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div style={{
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--paper)',
      padding: '20px 22px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      transition: 'border-color 120ms ease',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--line-2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
    >
      <div style={{
        width: 38, height: 46, flexShrink: 0,
        background: '#fff0ef',
        border: '1px solid rgba(168,50,44,0.18)',
        borderRadius: 'var(--radius)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 2,
      }}>
        <svg width="16" height="18" viewBox="0 0 16 20" fill="none">
          <path d="M2 2h8l4 4v12a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="var(--danger)" strokeWidth="1.3" fill="none"/>
          <path d="M10 2v4h4" stroke="var(--danger)" strokeWidth="1.3" fill="none"/>
        </svg>
        <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--danger)', letterSpacing: '0.04em' }}>PDF</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{cv.owner_name}</div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{cv.label}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 4 }}>
          {formatSize(cv.file_size)} · Uploaded {formatDate(cv.uploaded_at)}
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading}
        style={{
          fontSize: 12, fontWeight: 500, padding: '7px 16px',
          borderRadius: 'var(--radius-full)', border: '1px solid var(--accent)',
          color: 'white', background: 'var(--accent)', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          flexShrink: 0, opacity: downloading ? 0.6 : 1,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        {downloading ? 'Downloading…' : 'Download CV'}
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      textAlign: 'center', padding: '56px 24px',
      border: '1px dashed var(--line-2)', borderRadius: 'var(--radius-md)',
    }}>
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 14px', display: 'block', color: 'var(--ink-4)' }}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>No CVs available yet</div>
      <div style={{ fontSize: 13, color: 'var(--ink-4)' }}>Candidates haven't shared their primary CVs yet. Check back soon.</div>
    </div>
  );
}

export default function RecruiterPage() {
  useSEO({ title: 'Recruiter — CVs', description: 'Browse primary CVs from TPM candidates with UK visa sponsorship experience.' });
  const { user } = useAuth();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const allowed = user?.email === 'kasidkhan@gmail.com';

  useEffect(() => {
    if (!allowed) { setLoading(false); return; }
    listRecruiterCvs()
      .then(setCvs)
      .catch(() => setError('Failed to load CVs'))
      .finally(() => setLoading(false));
  }, [allowed]);

  if (user === undefined) return null;

  if (!allowed) {
    return (
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '64px var(--s-9) 96px', textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>Access restricted</div>
        <div style={{ fontSize: 13, color: 'var(--ink-4)' }}>This page is only available to approved recruiters.</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '64px var(--s-9) 96px' }}>
      <div className="eyebrow" style={{ marginBottom: 10, color: 'var(--accent)' }}>RECRUITER</div>
      <h1 style={{ margin: '0 0 8px' }}>Candidate <span style={{ color: 'var(--accent)' }}>CVs</span></h1>
      <p style={{ fontSize: 15, color: 'var(--ink-3)', marginBottom: 40 }}>
        Browse and download primary CVs from TPM candidates actively looking for roles with visa sponsorship in the UK.
      </p>

      {loading ? (
        <p style={{ fontSize: 14, color: 'var(--ink-4)' }}>Loading…</p>
      ) : error ? (
        <p style={{ fontSize: 14, color: 'var(--danger)' }}>{error}</p>
      ) : cvs.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 12 }}>
            <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{cvs.length}</span>{' '}
            {cvs.length === 1 ? 'candidate' : 'candidates'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cvs.map(cv => <RecruiterCvCard key={cv.id} cv={cv} />)}
          </div>
        </>
      )}
    </div>
  );
}
