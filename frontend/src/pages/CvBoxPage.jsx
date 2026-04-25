import { useState, useEffect, useRef, useCallback } from 'react';
import useSEO from '../hooks/useSEO';
import { useAuth } from '../context/AuthContext';
import { loginUrl } from '../services/authApi';
import { listCvs, uploadCv, downloadCv, deleteCv, renameCv, createShare, listShares, revokeShare } from '../services/cvApi';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function useToast() {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismiss = useCallback(id => setToasts(prev => prev.filter(t => t.id !== id)), []);

  return { toasts, push, dismiss };
}

function ToastStack({ toasts, dismiss }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 200, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 16px',
          borderRadius: 'var(--radius-md)',
          background: t.type === 'error' ? '#fff0ef' : '#f0faf4',
          border: `1px solid ${t.type === 'error' ? 'var(--danger)' : 'var(--verified)'}`,
          color: t.type === 'error' ? 'var(--danger)' : 'var(--verified)',
          fontSize: 13, fontWeight: 500,
          boxShadow: 'var(--shadow-1)',
          minWidth: 240, maxWidth: 360,
          pointerEvents: 'all',
        }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            {t.type === 'error'
              ? <path d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 5v4M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              : <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            }
          </svg>
          <span style={{ flex: 1 }}>{t.message}</span>
          <button onClick={() => dismiss(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.5, padding: 2, lineHeight: 1, fontSize: 14 }}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ─── PDF icon ─────────────────────────────────────────────────────────────────

function PdfIcon() {
  return (
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
  );
}

// ─── Inline rename ────────────────────────────────────────────────────────────

function EditableLabel({ value, cvId, onRenamed }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef();

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  async function save() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === value) { cancel(); return; }
    setSaving(true);
    try {
      await renameCv(cvId, trimmed);
      onRenamed(cvId, trimmed);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  function cancel() { setEditing(false); setDraft(value); }

  function handleKeyDown(e) {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') cancel();
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        disabled={saving}
        style={{
          fontSize: 14, fontWeight: 600, color: 'var(--ink)',
          border: '1px solid var(--accent)', borderRadius: 'var(--radius)',
          padding: '2px 8px', background: 'var(--paper)',
          outline: 'none', width: '100%', boxSizing: 'border-box',
        }}
      />
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      title="Click to rename"
      style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', cursor: 'text', display: 'inline-flex', alignItems: 'center', gap: 5 }}
    >
      {value}
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.3, flexShrink: 0 }}>
        <path d="M11.5 2.5l2 2-9 9H2.5v-2l9-9z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </svg>
    </div>
  );
}

// ─── CV card ──────────────────────────────────────────────────────────────────

function ShareRow({ share, onRevoke }) {
  const [revoking, setRevoking] = useState(false);

  async function handleRevoke() {
    setRevoking(true);
    await onRevoke(share.token);
    setRevoking(false);
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 12px',
      background: 'var(--paper-2)',
      borderRadius: 'var(--radius)',
      fontSize: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <a
          href={share.url}
          target="_blank"
          rel="noopener noreferrer"
          title="Open share link"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            color: 'var(--accent)',
            textDecoration: 'none', fontWeight: 500,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M10 2h4v4M14 2l-7 7M6 4H3a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Open link
        </a>
        <span style={{ color: 'var(--ink-4)' }}>·</span>
        <span style={{ color: 'var(--ink-4)' }}>Created {formatDate(share.created_at)}</span>
        <span style={{ color: 'var(--ink-4)' }}>·</span>
        <span style={{ color: 'var(--ink-4)' }}>
          {share.view_count === 0
            ? 'Not viewed yet'
            : `Viewed ${share.view_count} time${share.view_count > 1 ? 's' : ''}${share.last_viewed_at ? ` · Last opened ${formatDate(share.last_viewed_at)}` : ''}`
          }
        </span>
      </div>
      <button
        onClick={handleRevoke}
        disabled={revoking}
        style={{
          fontSize: 11, padding: '3px 10px',
          borderRadius: 'var(--radius-full)', border: '1px solid var(--line)',
          color: 'var(--ink-4)', background: 'var(--paper)', cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        {revoking ? 'Revoking…' : 'Revoke'}
      </button>
    </div>
  );
}

function CvCard({ cv, onDelete, onDownload, onRenamed, pushToast }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shares, setShares] = useState([]);
  const [loadingShares, setLoadingShares] = useState(true);
  const [showShares, setShowShares] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    listShares(cv.id)
      .then(setShares)
      .catch(() => {})
      .finally(() => setLoadingShares(false));
  }, [cv.id]);

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return; }
    setDeleting(true);
    await onDelete(cv.id);
  }

  async function handleDownload() {
    setDownloading(true);
    await onDownload(cv.id, cv.filename);
    setDownloading(false);
  }

  async function handleShare() {
    setSharing(true);
    try {
      const share = await createShare(cv.id);
      await navigator.clipboard.writeText(share.url);
      pushToast('Link copied to clipboard');
      setShares(prev => prev ? [share, ...prev] : [share]);
      setShowShares(true);
    } catch {
      pushToast('Failed to create share link', 'error');
    } finally {
      setSharing(false);
    }
  }

  function toggleShares() {
    setShowShares(prev => !prev);
  }

  async function handleRevoke(token) {
    try {
      await revokeShare(token);
      setShares(prev => prev.filter(s => s.token !== token));
      pushToast('Share link revoked');
    } catch {
      pushToast('Failed to revoke link', 'error');
    }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? 'var(--line-2)' : 'var(--line)'}`,
        borderRadius: 'var(--radius-md)',
        background: 'var(--paper)',
        transition: 'border-color 120ms ease',
        overflow: 'hidden',
      }}
    >
      {/* Main row */}
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <PdfIcon />
        <div style={{ flex: 1, minWidth: 0 }}>
          <EditableLabel value={cv.label} cvId={cv.id} onRenamed={onRenamed} />
          <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>
            {cv.filename} · {formatSize(cv.file_size)} · Uploaded {formatDate(cv.uploaded_at)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              fontSize: 12, fontWeight: 500, padding: '5px 12px',
              borderRadius: 'var(--radius-full)', border: '1px solid var(--line)',
              color: 'var(--ink-2)', background: 'var(--paper)', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {downloading ? 'Downloading…' : 'Download'}
          </button>
          <button
            onClick={handleShare}
            disabled={sharing}
            style={{
              fontSize: 12, fontWeight: 500, padding: '5px 12px',
              borderRadius: 'var(--radius-full)', border: '1px solid var(--line)',
              color: 'var(--accent)', background: 'var(--accent-wash)', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="12" cy="3" r="2" stroke="currentColor" strokeWidth="1.3"/>
              <circle cx="12" cy="13" r="2" stroke="currentColor" strokeWidth="1.3"/>
              <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M10.5 3.9L5.5 7.1M10.5 12.1L5.5 8.9" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
            {sharing ? 'Creating…' : 'Share'}
          </button>
          <button
            onClick={toggleShares}
            style={{
              fontSize: 12, padding: '5px 10px',
              borderRadius: 'var(--radius-full)', border: '1px solid var(--line)',
              color: 'var(--ink-4)', background: 'var(--paper)', cursor: 'pointer',
            }}
          >
            Links {shares ? `(${shares.length})` : ''}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              fontSize: 12, fontWeight: 500, padding: '5px 12px',
              borderRadius: 'var(--radius-full)', border: '1px solid',
              borderColor: confirming ? 'var(--danger)' : 'var(--line)',
              color: confirming ? 'var(--danger)' : 'var(--ink-4)',
              background: confirming ? '#fff0ef' : 'var(--paper)', cursor: 'pointer',
              transition: 'all 120ms ease',
            }}
          >
            {deleting ? 'Deleting…' : confirming ? 'Confirm delete' : 'Delete'}
          </button>
          {confirming && (
            <button
              onClick={() => setConfirming(false)}
              style={{
                fontSize: 12, padding: '5px 10px',
                borderRadius: 'var(--radius-full)', border: '1px solid var(--line)',
                color: 'var(--ink-4)', background: 'var(--paper)', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Share links panel */}
      {showShares && (
        <div style={{
          borderTop: '1px solid var(--line)',
          padding: '12px 18px',
          display: 'flex', flexDirection: 'column', gap: 6,
          background: 'var(--paper-2)',
        }}>
          {loadingShares ? (
            <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>Loading links…</div>
          ) : shares && shares.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>No active share links. Click Share to create one.</div>
          ) : (
            shares?.map(s => (
              <ShareRow key={s.token} share={s} onRevoke={handleRevoke} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Drop zone upload ─────────────────────────────────────────────────────────

function UploadSection({ onUploaded, pushToast }) {
  const [label, setLabel] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === 'application/pdf') setFile(dropped);
    else pushToast('Only PDF files are supported', 'error');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!label.trim() || !file) return;
    setUploading(true);
    try {
      await uploadCv(label.trim(), file);
      pushToast(`"${label.trim()}" uploaded`);
      setLabel('');
      setFile(null);
      onUploaded();
    } catch (err) {
      pushToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  }

  const canSubmit = !uploading && label.trim() && file;

  return (
    <div style={{
      border: '1px solid var(--line)', borderRadius: 'var(--radius-md)',
      padding: '24px', background: 'var(--paper)', marginBottom: 32,
    }}>
      <div className="eyebrow" style={{ marginBottom: 16 }}>Upload CV</div>
      <form onSubmit={handleSubmit}>
        {/* Drop zone */}
        <div
          onClick={() => fileRef.current.click()}
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          style={{
            border: `2px dashed ${dragging ? 'var(--accent)' : file ? 'var(--verified)' : 'var(--line-2)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '28px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? 'var(--accent-wash)' : file ? 'var(--verified-wash)' : 'var(--paper-2)',
            transition: 'all 150ms ease',
            marginBottom: 14,
            userSelect: 'none',
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={e => setFile(e.target.files[0] ?? null)}
          />
          {file ? (
            <>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 8px', display: 'block', color: 'var(--verified)' }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--verified)' }}>{file.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 3 }}>{formatSize(file.size)} · Click to change file</div>
            </>
          ) : (
            <>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 8px', display: 'block', color: dragging ? 'var(--accent)' : 'var(--ink-4)' }}>
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v5M9 15l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div style={{ fontSize: 14, fontWeight: 500, color: dragging ? 'var(--accent)' : 'var(--ink-2)' }}>
                {dragging ? 'Drop PDF here' : 'Drag & drop a PDF, or click to browse'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 3 }}>Max 5 MB · PDF only</div>
            </>
          )}
        </div>

        {/* Label + submit */}
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            placeholder="Label, e.g. TPM Finance, TPM Data Science"
            value={label}
            onChange={e => setLabel(e.target.value)}
            required
            style={{
              flex: 1, padding: '9px 14px', fontSize: 14,
              border: '1px solid var(--line)', borderRadius: 'var(--radius)',
              background: 'var(--paper)', color: 'var(--ink)',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              fontSize: 13, fontWeight: 500, padding: '9px 22px', whiteSpace: 'nowrap',
              borderRadius: 'var(--radius-full)', border: '1px solid var(--accent)',
              color: 'white', background: 'var(--accent)', cursor: canSubmit ? 'pointer' : 'default',
              opacity: canSubmit ? 1 : 0.4, transition: 'opacity 150ms ease',
            }}
          >
            {uploading ? 'Uploading…' : 'Upload CV'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Why section ─────────────────────────────────────────────────────────────

const CV_EXAMPLES = [
  {
    label: 'Infra TPM CV opens with',
    keywords: ['p99 latency', 'capacity', 'SLO', 'multi-region'],
  },
  {
    label: 'E-commerce TPM CV opens with',
    keywords: ['conversion', 'peak event', 'checkout', 'A/B'],
  },
  {
    label: 'Fintech TPM CV opens with',
    keywords: ['FCA / PSD2', 'settlement', 'fraud', 'audit'],
  },
  {
    label: 'Data platform TPM CV opens with',
    keywords: ['data contracts', 'pipelines', 'SLA', 'lineage'],
  },
];

function KeywordChip({ label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '4px 11px',
      borderRadius: 'var(--radius-full)',
      border: '1px solid var(--line-2)',
      background: 'var(--paper)',
      fontSize: 12, color: 'var(--ink-2)',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

function WhySection() {
  return (
    <div style={{
      borderTop: '1px solid var(--line)',
      paddingTop: 48,
      marginTop: 56,
    }}>
      <div className="eyebrow" style={{ marginBottom: 14 }}>Why multiple CVs</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 56px', alignItems: 'start' }}>

        {/* Left — prose */}
        <div>
          <h2 style={{ fontSize: 26, letterSpacing: '-0.02em', margin: '0 0 20px', lineHeight: 1.2 }}>
            One CV is one bet. TPMs win on tailored ones.
          </h2>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.7, margin: '0 0 16px' }}>
            An <strong style={{ color: 'var(--ink-2)' }}>infrastructure TPM</strong> wants to see SLO, capacity, on-call, and multi-region rollout language up top. An <strong style={{ color: 'var(--ink-2)' }}>e-commerce TPM</strong> wants peak-event readiness, conversion-rate work, and checkout reliability. Same career, different vocabulary.
          </p>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.7, margin: 0 }}>
            Recruiters and ATS keyword-match the first half of page one. A generic CV gets generically filtered.
          </p>
        </div>

        {/* Right — keyword cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CV_EXAMPLES.map(ex => (
            <div key={ex.label} style={{
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              background: 'var(--paper)',
            }}>
              <div className="eyebrow" style={{ fontSize: 10, marginBottom: 10 }}>{ex.label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ex.keywords.map(k => <KeywordChip key={k} label={k} />)}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{
      textAlign: 'center', padding: '52px 24px',
      border: '1px dashed var(--line-2)', borderRadius: 'var(--radius-md)',
    }}>
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 14px', display: 'block', color: 'var(--ink-4)' }}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M14 2v6h6M12 11v5M9.5 13.5l2.5 2.5 2.5-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>No CVs yet</div>
      <div style={{ fontSize: 13, color: 'var(--ink-4)' }}>Upload your first version above to get started.</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const GOOGLE_SVG = (
  <svg width="16" height="16" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

function SignInWall() {
  return (
    <div style={{
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      padding: '40px 36px',
      background: 'var(--paper-2)',
      textAlign: 'center',
      marginBottom: 32,
    }}>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 14px', display: 'block', color: 'var(--ink-4)' }}>
        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Sign in to access CV Box</div>
      <p style={{ fontSize: 13, color: 'var(--ink-4)', margin: '0 0 20px' }}>
        Upload and manage your tailored CV versions. Free with a Google account.
      </p>
      <a
        href={loginUrl()}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontSize: 13, fontWeight: 500, padding: '9px 20px',
          borderRadius: 'var(--radius-full)', border: '1px solid var(--line)',
          color: 'var(--ink-2)', textDecoration: 'none', background: 'var(--paper)',
        }}
      >
        {GOOGLE_SVG}
        Sign in with Google
      </a>
    </div>
  );
}

export default function CvBoxPage() {
  useSEO({ title: 'CV Box', description: 'Store and share tailored CV versions for TPM roles in the UK. One CV per role type — infrastructure, fintech, data, and more.' });
  const { user } = useAuth();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toasts, push: pushToast, dismiss } = useToast();

  async function load() {
    setLoading(true);
    try { setCvs(await listCvs()); }
    finally { setLoading(false); }
  }

  useEffect(() => { if (user) load(); else setLoading(false); }, [user]);

  async function handleDelete(id) {
    const cv = cvs.find(c => c.id === id);
    try {
      await deleteCv(id);
      setCvs(prev => prev.filter(c => c.id !== id));
      pushToast(`"${cv?.label}" deleted`);
    } catch {
      pushToast('Delete failed', 'error');
    }
  }

  async function handleDownload(id, filename) {
    try {
      await downloadCv(id, filename);
      pushToast(`${filename} downloaded`);
    } catch {
      pushToast('Download failed', 'error');
    }
  }

  function handleRenamed(id, newLabel) {
    setCvs(prev => prev.map(c => c.id === id ? { ...c, label: newLabel } : c));
    pushToast(`Renamed to "${newLabel}"`);
  }

  const totalSize = cvs.reduce((sum, c) => sum + c.file_size, 0);

  if (user === undefined) return null; // auth still loading

  return (
    <>
      <ToastStack toasts={toasts} dismiss={dismiss} />
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '64px var(--s-9) 96px' }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>CV BOX</div>
        <h1 style={{ margin: '0 0 8px' }}>One career, many CVs.</h1>
        <p style={{ fontSize: 15, color: 'var(--ink-3)', marginBottom: 40 }}>
          A single CV rarely wins across different industries. Store tailored versions here, one per role type, and share the right one with every recruiter.
        </p>

        {user ? (
          <>
            <UploadSection onUploaded={load} pushToast={pushToast} />

            {loading ? (
              <p style={{ fontSize: 14, color: 'var(--ink-4)' }}>Loading…</p>
            ) : cvs.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 10 }}>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{cvs.length}</span>{' '}
                  {cvs.length === 1 ? 'version' : 'versions'} · {formatSize(totalSize)} total
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {cvs.map(cv => (
                    <CvCard
                      key={cv.id}
                      cv={cv}
                      onDelete={handleDelete}
                      onDownload={handleDownload}
                      onRenamed={handleRenamed}
                      pushToast={pushToast}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <SignInWall />
        )}

        <WhySection />
      </div>
    </>
  );
}
