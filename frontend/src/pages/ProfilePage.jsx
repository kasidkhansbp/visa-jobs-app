import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, getPipeline } from '../services/profileApi';
import '../styles/profile.css';

const STATUS_LABELS = {
  applied: 'Applied',
  interview_scheduled: 'Interviewing',
  offer_received: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  no_response: 'No Response',
};

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function completeness(profile) {
  const checks = [
    profile.headline,
    profile.summary,
    profile.location,
    profile.years_experience != null,
    profile.target_level,
    profile.salary_min || profile.salary_max,
    profile.work_mode,
    profile.visa_status,
    profile.cv_count > 0,
    profile.story_count > 0,
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

/* Per-field edit config: how to read a draft from the profile, how to render it,
 * how to turn the draft back into a PATCH body, and how to display it read-only.
 * Patch values mirror the gateway's ProfileUpdate constraints (empty → null). */
const FIELD = {
  name:        { label: 'Name',             type: 'text',     placeholder: 'e.g. Jane Doe',                       get: p => p.name ?? '',     patch: v => ({ name: v.trim() }),                 display: p => p.name },
  headline:    { label: 'Headline',         type: 'text',     placeholder: 'e.g. Senior Technical Program Manager', get: p => p.headline ?? '', patch: v => ({ headline: v.trim() || null }),      display: p => p.headline },
  location:    { label: 'Location',         type: 'text',     placeholder: 'e.g. London, UK',                     get: p => p.location ?? '', patch: v => ({ location: v.trim() || null }),      display: p => p.location },
  years_experience: {
    label: 'Years of experience', type: 'number', placeholder: 'e.g. 8',
    get: p => (p.years_experience ?? ''),
    patch: v => ({ years_experience: v === '' ? null : Number(v) }),
    display: p => (p.years_experience != null ? `${p.years_experience} yrs` : null),
  },
  summary:     { label: 'Summary',          type: 'textarea', placeholder: 'A short professional bio — your focus, strengths, and what you are looking for.', get: p => p.summary ?? '',  patch: v => ({ summary: v.trim() || null }),       display: p => p.summary },
  target_level: { label: 'Target level',    type: 'text', placeholder: 'e.g. Senior, Staff, Principal', get: p => p.target_level ?? '', patch: v => ({ target_level: v.trim() || null }), display: p => p.target_level },
  work_mode: {
    label: 'Work mode', type: 'select', options: ['Any', 'Remote', 'Hybrid', 'On-site'],
    get: p => p.work_mode ?? '', patch: v => ({ work_mode: v || null }), display: p => p.work_mode,
  },
  preferred_locations: { label: 'Locations', type: 'text', placeholder: 'e.g. London, Remote UK', get: p => p.preferred_locations ?? '', patch: v => ({ preferred_locations: v.trim() || null }), display: p => p.preferred_locations },
  notice_period: { label: 'Notice period', type: 'text', placeholder: 'e.g. 1 month', get: p => p.notice_period ?? '', patch: v => ({ notice_period: v.trim() || null }), display: p => p.notice_period },
  visa_status: { label: 'Status', type: 'text', placeholder: 'e.g. Skilled Worker visa', get: p => p.visa_status ?? '', patch: v => ({ visa_status: v.trim() || null }), display: p => p.visa_status },
  visa_expiry: {
    label: 'Expires', type: 'date',
    get: p => (p.visa_expiry ? p.visa_expiry.slice(0, 10) : ''),
    patch: v => ({ visa_expiry: v || null }),
    display: p => (p.visa_expiry ? formatDate(p.visa_expiry) : null),
  },
  sponsorship_required: {
    label: 'Sponsorship', type: 'select',
    options: [{ value: 'true', label: 'Required' }, { value: 'false', label: 'Not required' }],
    get: p => (p.sponsorship_required == null ? '' : String(p.sponsorship_required)),
    patch: v => ({ sponsorship_required: v === '' ? null : v === 'true' }),
    display: p => (p.sponsorship_required == null ? null : p.sponsorship_required ? 'Required' : 'Not required'),
  },
};

const Arrow = () => (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10 L15 10"/><path d="M10 5 L15 10 L10 15"/>
  </svg>
);

const Pencil = () => (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.5 4.5 L15.5 7.5"/><path d="M13.5 3.5 L16.5 6.5 L7 16 L3.5 16.5 L4 13 Z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.57.1.78-.25.78-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.55-.3-5.24-1.28-5.24-5.7 0-1.26.45-2.3 1.19-3.1-.12-.3-.51-1.48.11-3.08 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.5 3.18-1.18 3.18-1.18.62 1.6.23 2.78.11 3.08.74.8 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.07.78 2.16v3.2c0 .31.2.67.79.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z"/>
  </svg>
);

/* Inline editor for a single field. Defined at module scope so React keeps the
 * input mounted (and focused) while editing instead of remounting each render. */
function FieldInput({ field, value, onChange, onSubmit, onCancel, saving, error, variant = 'inline' }) {
  const handleKey = e => { if (e.key === 'Escape') { e.preventDefault(); onCancel(); } };
  return (
    <div className={`pf-edit pf-edit-${variant}`}>
      <form className="pf-edit-form" onSubmit={e => { e.preventDefault(); onSubmit(); }}>
        {field.type === 'select' ? (
          <select className="pf-input" autoFocus value={value} onChange={e => onChange(e.target.value)} onKeyDown={handleKey}>
            <option value="">—</option>
            {field.options.map(o => {
              const val = typeof o === 'string' ? o : o.value;
              const lbl = typeof o === 'string' ? o : o.label;
              return <option key={val} value={val}>{lbl}</option>;
            })}
          </select>
        ) : field.type === 'textarea' ? (
          <textarea
            className="pf-input pf-textarea" rows={6} autoFocus maxLength={2000} placeholder={field.placeholder}
            value={value} onChange={e => onChange(e.target.value)} onKeyDown={handleKey}
          />
        ) : (
          <input
            type={field.type} className="pf-input" autoFocus placeholder={field.placeholder}
            {...(field.type === 'number' ? { min: 0, max: 99 } : {})}
            maxLength={field.maxLength ?? 30}
            value={value} onChange={e => onChange(e.target.value)} onKeyDown={handleKey}
          />
        )}
        <div className="pf-edit-actions">
          <button type="submit" className="pf-save" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          <button type="button" className="pf-cancel" onClick={onCancel} disabled={saving}>Cancel</button>
        </div>
      </form>
      {error && <span className="pf-edit-err">{error}</span>}
    </div>
  );
}

export default function ProfilePage() {
  useSEO({ title: 'Profile', description: 'Your TPMguild profile.' });
  const { user, login } = useAuth();

  const [profile, setProfile] = useState(null);
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  // Inline editing: which field is open, its draft value, and save status.
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Social links: a single combined editor for LinkedIn + GitHub.
  const [editingLinks, setEditingLinks] = useState(false);
  const [linkDraft, setLinkDraft] = useState({ linkedin_url: '', github_url: '' });
  const [linksSaving, setLinksSaving] = useState(false);
  const [linksError, setLinksError] = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    Promise.all([getProfile(), getPipeline()])
      .then(([p, pl]) => { setProfile(p); setPipeline(pl); })
      .finally(() => setLoading(false));
  }, [user]);

  function startEdit(key) {
    setError(null);
    setDraft(FIELD[key].get(profile));
    setEditing(key);
  }

  function cancelEdit() {
    setEditing(null);
    setError(null);
  }

  async function commitEdit() {
    if (!editing || saving) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateProfile(FIELD[editing].patch(draft));
      setProfile(updated);
      setEditing(null);
    } catch (e) {
      setError(e.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  function startLinksEdit() {
    setLinksError(null);
    setLinkDraft({ linkedin_url: profile.linkedin_url ?? '', github_url: profile.github_url ?? '' });
    setEditingLinks(true);
  }

  function cancelLinksEdit() {
    setEditingLinks(false);
    setLinksError(null);
  }

  async function commitLinksEdit() {
    if (linksSaving) return;
    setLinksSaving(true);
    setLinksError(null);
    try {
      const updated = await updateProfile({
        linkedin_url: linkDraft.linkedin_url.trim() || null,
        github_url: linkDraft.github_url.trim() || null,
      });
      setProfile(updated);
      setEditingLinks(false);
    } catch (e) {
      setLinksError(e.message || 'Update failed');
    } finally {
      setLinksSaving(false);
    }
  }

  async function handleToggleOtw() {
    if (!profile || toggling) return;
    setToggling(true);
    try {
      const updated = await updateProfile({ open_to_work: !profile.open_to_work });
      setProfile(updated);
    } catch { /* keep current state */ }
    finally { setToggling(false); }
  }

  if (user === undefined) return null;
  if (!user) {
    return (
      <div className="pf-shell">
        <div className="eyebrow" style={{ marginBottom: 10, color: 'var(--accent)' }}>PROFILE</div>
        <h1 style={{ margin: '0 0 8px' }}>Your profile.</h1>
        <p style={{ fontSize: 15, color: 'var(--ink-3)', marginBottom: 40 }}>Sign in to view and manage your profile.</p>
        <button onClick={login} className="pf-edit-link" style={{ fontSize: 14, color: 'var(--accent)' }}>Sign in with Google</button>
      </div>
    );
  }
  if (loading) {
    return <div className="pf-shell"><p style={{ fontSize: 14, color: 'var(--ink-4)' }}>Loading...</p></div>;
  }
  if (!profile) return null;

  const pct = completeness(profile);

  // Read-only row with a hover-revealed pencil, or the inline editor when open.
  const renderRow = (key, rowClass, keyClass, valClass) => {
    const field = FIELD[key];
    const isEditing = editing === key;
    const val = field.display(profile);
    return (
      <div className={rowClass} key={key}>
        <span className={keyClass}>{field.label}</span>
        {isEditing ? (
          <FieldInput
            field={field} value={draft} onChange={setDraft}
            onSubmit={commitEdit} onCancel={cancelEdit} saving={saving} error={error}
          />
        ) : (
          <span className={`${valClass}${val ? '' : ' empty'}`}>
            <span className="pf-val-text">{val || '—'}</span>
            <button className="pf-row-edit" onClick={() => startEdit(key)} aria-label={`Edit ${field.label}`}><Pencil /></button>
          </span>
        )}
      </div>
    );
  };

  // Header subtitle segment (headline / location / years).
  const renderSeg = (key) => {
    const field = FIELD[key];
    const val = field.display(profile);
    return (
      <span className="pf-seg" key={key}>
        {val
          ? (key === 'headline' ? <b>{val}</b> : <span>{val}</span>)
          : <span className="pf-seg-empty">Add {field.label.toLowerCase()}</span>}
        <button className="pf-seg-edit" onClick={() => startEdit(key)} aria-label={`Edit ${field.label}`}><Pencil /></button>
      </span>
    );
  };

  const editingHeaderSub = ['headline', 'location', 'years_experience'].includes(editing);

  const tiles = [
    { label: 'CV Box',  stat: profile.cv_count,        unit: 'versions', desc: 'Tailored CVs with shareable links.', cta: 'Manage CVs',    to: '/cv' },
    { label: 'Stories', stat: profile.story_count,      unit: 'written',  desc: 'Behavioral narratives, sharpened.',  cta: 'Open Stories',  to: '/stories' },
    { label: 'Prep',    stat: profile.question_total,   unit: 'questions', desc: 'Interview questions across categories.', cta: 'Continue prep', to: '/resources' },
  ];

  return (
    <div className="pf-shell">
      {/* ── Header ── */}
      <div className="pf-head">
        <div className="pf-avatar">
          {profile.picture
            ? <img src={profile.picture} alt={profile.name} />
            : initials(profile.name)
          }
        </div>
        <div className="pf-id">
          <div className="eyebrow">YOUR PROFILE</div>
          {editing === 'name' ? (
            <FieldInput
              field={FIELD.name} value={draft} onChange={setDraft}
              onSubmit={commitEdit} onCancel={cancelEdit} saving={saving} error={error} variant="title"
            />
          ) : (
            <h1 className="pf-editable-title">
              {profile.name}
              <button className="pf-row-edit" onClick={() => startEdit('name')} aria-label="Edit name"><Pencil /></button>
            </h1>
          )}
          {editingHeaderSub ? (
            <div className="pf-id-edit">
              <span className="pf-edit-label">{FIELD[editing].label}</span>
              <FieldInput
                field={FIELD[editing]} value={draft} onChange={setDraft}
                onSubmit={commitEdit} onCancel={cancelEdit} saving={saving} error={error} variant="header"
              />
            </div>
          ) : (
            <div className="pf-id-sub">
              {renderSeg('headline')}
              {renderSeg('location')}
              {renderSeg('years_experience')}
            </div>
          )}

          {/* Social links — one combined editor; icons show only when set */}
          {editingLinks ? (
            <div className="pf-links-editor">
              <form className="pf-links-form" onSubmit={e => { e.preventDefault(); commitLinksEdit(); }}>
                <label className="pf-links-field">
                  <span className="pf-links-label">LinkedIn</span>
                  <input
                    type="url" className="pf-input" autoFocus maxLength={255}
                    placeholder="https://linkedin.com/in/your-handle"
                    value={linkDraft.linkedin_url}
                    onChange={e => setLinkDraft(d => ({ ...d, linkedin_url: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); cancelLinksEdit(); } }}
                  />
                </label>
                <label className="pf-links-field">
                  <span className="pf-links-label">GitHub</span>
                  <input
                    type="url" className="pf-input" maxLength={255}
                    placeholder="https://github.com/your-handle"
                    value={linkDraft.github_url}
                    onChange={e => setLinkDraft(d => ({ ...d, github_url: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); cancelLinksEdit(); } }}
                  />
                </label>
                <div className="pf-edit-actions">
                  <button type="submit" className="pf-save" disabled={linksSaving}>{linksSaving ? 'Saving…' : 'Save'}</button>
                  <button type="button" className="pf-cancel" onClick={cancelLinksEdit} disabled={linksSaving}>Cancel</button>
                </div>
              </form>
              {linksError && <span className="pf-edit-err">{linksError}</span>}
            </div>
          ) : (
            <div className="pf-links">
              {profile.linkedin_url && (
                <a className="pf-link pf-link-linkedin" href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile">
                  <LinkedInIcon />
                </a>
              )}
              {profile.github_url && (
                <a className="pf-link pf-link-github" href={profile.github_url} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile">
                  <GitHubIcon />
                </a>
              )}
              <button className="pf-links-edit" onClick={startLinksEdit}>
                <Pencil />
                {!profile.linkedin_url && !profile.github_url && <span>Add LinkedIn / GitHub</span>}
              </button>
            </div>
          )}
        </div>
        <div className="pf-status">
          <button
            className={`pf-otw ${profile.open_to_work ? '' : 'off'}`}
            onClick={handleToggleOtw}
            disabled={toggling}
          >
            <span className="pulse" />
            {profile.open_to_work ? 'Open to opportunities' : 'Not looking right now'}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="pf-body">
        {/* Sidebar */}
        <aside className="pf-sidebar">
          {/* Completeness */}
          <div>
            <div className="pf-complete-head">
              <span className="pf-complete-label">Profile strength</span>
              <span className="pf-complete-pct">{pct}%</span>
            </div>
            <div className="pf-meter"><div className="pf-meter-fill" style={{ '--pct': `${pct}%` }} /></div>
            {pct < 100 && (
              <p className="pf-complete-hint">
                {!profile.headline && 'Add a headline. '}
                {!profile.summary && 'Write a summary. '}
                {profile.cv_count === 0 && 'Upload a CV. '}
                {profile.story_count === 0 && 'Write a story. '}
              </p>
            )}
          </div>

          {/* Search preferences */}
          <div>
            <div className="pf-block-label">Search preferences</div>
            <div className="pf-prefs">
              {['target_level', 'work_mode', 'preferred_locations', 'notice_period']
                .map(k => renderRow(k, 'pf-pref', 'pf-pref-key', 'pf-pref-val'))}
            </div>
          </div>

          {/* Visa & sponsorship */}
          <div>
            <div className="pf-block-label">Visa &amp; sponsorship</div>
            <div className="pf-visa">
              {['visa_status', 'visa_expiry', 'sponsorship_required']
                .map(k => renderRow(k, 'pf-visa-row', 'pf-visa-key', 'pf-visa-val'))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="pf-main">
          {/* Summary */}
          <section>
            <div className="pf-section-head">
              <h2>Summary</h2>
              {editing !== 'summary' && (
                <button className="pf-section-edit" onClick={() => startEdit('summary')} aria-label="Edit summary">
                  <Pencil /> Edit
                </button>
              )}
            </div>
            {editing === 'summary' ? (
              <FieldInput
                field={FIELD.summary} value={draft} onChange={setDraft}
                onSubmit={commitEdit} onCancel={cancelEdit} saving={saving} error={error} variant="block"
              />
            ) : profile.summary ? (
              <p className="pf-summary">{profile.summary}</p>
            ) : (
              <div className="pf-empty">No summary yet. Add a short professional bio so recruiters know your story at a glance.</div>
            )}
          </section>

          {/* Toolkit tiles */}
          <section>
            <div className="pf-section-head">
              <h2>Your toolkit</h2>
              <span className="pf-section-meta">ACROSS TPMGUILD</span>
            </div>
            <div className="pf-tiles">
              {tiles.map(t => (
                <Link key={t.label} className="pf-tile" to={t.to}>
                  <span className="pf-tile-label">{t.label}</span>
                  <span className="pf-tile-stat">{t.stat}<small>{t.unit}</small></span>
                  <span className="pf-tile-desc">{t.desc}</span>
                  <span className="pf-tile-cta">{t.cta} <Arrow /></span>
                </Link>
              ))}
            </div>
          </section>

          {/* Application pipeline */}
          <section>
            <div className="pf-section-head">
              <h2>Application pipeline</h2>
              <Link className="pf-section-link" to="/tracker">View all &rarr;</Link>
            </div>
            {pipeline.length > 0 ? (
              <div className="pf-pipe">
                {pipeline.map(app => (
                  <div key={app.id} className="pf-pipe-row">
                    <div className="pf-pipe-logo">{app.company.charAt(0).toUpperCase()}</div>
                    <div className="pf-pipe-meta">
                      <div className="pf-pipe-title">{app.role?.[0] || 'Role not specified'}</div>
                      <div className="pf-pipe-co">{app.company}</div>
                    </div>
                    <span className={`pf-chip ${app.status}`}>
                      <span className="dot" />
                      {STATUS_LABELS[app.status] || app.status}
                    </span>
                    <span className="pf-pipe-date">{formatDate(app.applied_at || app.updated_at)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pf-empty">No applications tracked yet. Connect Gmail in the Tracker to get started.</div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
