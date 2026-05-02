import { useState, useEffect, useRef } from 'react';
import useSEO from '../hooks/useSEO';
import { useAuth } from '../context/AuthContext';
import { useStories } from '../context/StoriesContext';
import { loginUrl } from '../services/authApi';
import { createStory, updateStory, deleteStory } from '../services/storiesApi';
import '../styles/stories.css';

// ── Icons ─────────────────────────────────────────────────────────────────────
const SI = (path, vb = '0 0 20 20') => (props) => (
  <svg width={props.size || 16} height={props.size || 16} viewBox={vb} fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
);
const IPlus  = SI(<><path d="M10 4 V16"/><path d="M4 10 H16"/></>);
const ICheck = SI(<path d="M4 10.5 L8 14.5 L16 6"/>);
const ITrash = SI(<><path d="M4 6 L16 6"/><path d="M8 6 V4 H12 V6"/><path d="M5 6 L6 17 H14 L15 6"/></>);
const IBolt  = SI(<path d="M11 2 L4 12 H9 L8 18 L16 7 H11 Z"/>);
const IEdit  = SI(<><path d="M11.5 4.5l4 4-9 9H3v-4l9-9z"/><path d="M14 2l4 4"/></>);

const PROMPTS = [
  { key: 'broken',   kicker: '01', label: 'What was broken + impact?',
    help: 'The concrete problem and what it was costing — in money, time, users, or trust.',
    placeholder: 'Settlement reconciliation took 48 hours; £1.4B daily volume sitting in suspense...' },
  { key: 'urgency',  kicker: '02', label: 'Why now — urgency?',
    help: 'What forced the timing? A regulator deadline, a peak event, a board commitment.',
    placeholder: 'PSD2 SCA enforcement date was 90 days out and we had no rollout plan...' },
  { key: 'role',     kicker: '03', label: 'Your role — ownership?',
    help: 'Where exactly did the buck stop with you? Be specific — convener, decider, escalation point.',
    placeholder: 'Single-threaded owner across Eng, Risk, Legal — the one name on the exec brief...' },
  { key: 'tech',     kicker: '04', label: 'Challenge — Technical',
    help: 'The hardest engineering trade-off. Architecture, scale, latency, data.',
    placeholder: "Legacy ledger couldn't guarantee idempotency on retries..." },
  { key: 'org',      kicker: '05', label: 'Challenge — Organisational',
    help: 'The people problem. Misaligned teams, competing roadmaps, missing accountability.',
    placeholder: "Two VPs disagreed on whether Risk or Eng owned the SCA exemption logic..." },
  { key: 'decision', kicker: '06', label: 'Challenge — Decision',
    help: 'The call only you could make. What were the options, what did you choose, why?',
    placeholder: 'Ship in 8 markets on time vs. all 14 late — chose 8 + a phased rollout...' },
  { key: 'hardest',  kicker: '07', label: 'Hardest moment',
    help: 'The lowest point — and what you did next. Interviewers always come back to this.',
    placeholder: 'T-3 weeks, prod outage in pilot market. Exec call at 11pm asking if we should pull the plug...' },
  { key: 'impact',   kicker: '08', label: 'Real impact',
    help: 'Numbers, names, signatures. What changed? What lasted past the launch?',
    placeholder: '14 markets live, zero compliance breaches in 18 months, fraud loss down 38%...' },
];

const SECTION_KEYS = PROMPTS.map(p => p.key);

// ── Read view for a single prompt section ────────────────────────────────────
function SectionReadView({ prompt, value }) {
  return (
    <div className={`st-prompt ${value?.trim() ? 'filled' : ''} ${['broken','hardest','impact'].includes(prompt.key) ? 'full' : ''}`}>
      <div className="st-prompt-label">
        <span className="st-prompt-kicker">{prompt.kicker}</span>
        <span>{prompt.label}</span>
      </div>
      <p className="st-prompt-help">{prompt.help}</p>
      {value?.trim() ? (
        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--ink)', margin: 0, whiteSpace: 'pre-wrap' }}>{value}</p>
      ) : (
        <p style={{ fontSize: 14, color: 'var(--ink-4)', margin: 0, fontStyle: 'italic' }}>Not answered yet.</p>
      )}
    </div>
  );
}

// ── Story body — read or edit ─────────────────────────────────────────────────
function StoryBody({ story, onSaved, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  function startEdit() {
    setDraft({ title: story.title, narrative: story.narrative, sharpen: { ...story.sharpen } });
    setEditing(true);
    setError(null);
  }

  function cancelEdit() {
    setDraft(null);
    setEditing(false);
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateStory(story.id, {
        title: draft.title,
        narrative: draft.narrative,
        sharpen: draft.sharpen,
      });
      onSaved(updated);
      setEditing(false);
      setDraft(null);
    } catch {
      setError('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${story.title}"? This can't be undone.`)) return;
    setDeleting(true);
    try {
      const seed = await deleteStory(story.id);
      onDeleted(story.id, seed);
    } catch {
      setError('Delete failed. Please try again.');
      setDeleting(false);
    }
  }

  const wordCount = ((editing ? draft?.narrative : story.narrative) || '').trim().split(/\s+/).filter(Boolean).length;
  const filledCount = SECTION_KEYS.filter(k => (story.sharpen[k] || '').trim()).length;
  const current = editing ? draft : story;

  return (
    <div className="st-body">
      {/* Title row */}
      <div className="st-title-row">
        {editing ? (
          <input
            className="st-title-input"
            value={draft.title}
            onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
            placeholder="Untitled story"
          />
        ) : (
          <h2 className="st-title-input" style={{ cursor: 'default', fontWeight: 600, fontSize: 32, margin: 0, border: 'none', padding: '4px 0' }}>
            {story.title || 'Untitled story'}
          </h2>
        )}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {!editing && (
            <button className="btn" onClick={startEdit} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13, padding: '6px 14px',
              border: '1px solid var(--line)', borderRadius: 'var(--radius-full)',
              background: 'var(--paper)', color: 'var(--ink-2)', cursor: 'pointer',
            }}>
              <IEdit size={13}/> Edit
            </button>
          )}
        </div>
      </div>

      {error && (
        <p style={{ fontSize: 13, color: 'var(--danger)', margin: 0 }}>{error}</p>
      )}

      {/* Narrative */}
      <section className="st-section">
        <div className="st-section-head">
          <div className="eyebrow">YOUR STORY</div>
          <div className="st-rule"/>
          <div className="st-section-hint">Long-form · your voice</div>
        </div>
        {editing ? (
          <>
            <textarea
              className="st-narrative"
              value={draft.narrative}
              onChange={e => setDraft(d => ({ ...d, narrative: e.target.value }))}
              placeholder="Write it the way you'd tell it to a colleague over coffee..."
            />
            <div className="st-narrative-foot">
              <span className="mono">{wordCount} word{wordCount === 1 ? '' : 's'}</span>
              <span>Aim for 200–400 words. Don't edit yet.</span>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink)', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
            {story.narrative || <span style={{ color: 'var(--ink-4)', fontStyle: 'italic' }}>No story written yet. Click Edit to start.</span>}
          </div>
        )}
      </section>

      {/* Sharpen */}
      <section className="st-section">
        <div className="st-section-head">
          <div className="eyebrow"><IBolt size={11}/> SHARPEN YOUR STORY</div>
          <div className="st-rule"/>
          <div className="st-section-hint">
            <b style={{ fontFamily: 'Courier New', color: 'var(--ink)' }}>{filledCount}</b> of {PROMPTS.length} answered
          </div>
        </div>
        {!editing && <p className="st-sharpen-intro">Eight short answers that map to what behavioral panels actually probe for.</p>}
        {editing && <p className="st-sharpen-intro">Two or three sentences each — not paragraphs.</p>}
        <div className="st-prompt-grid">
          {PROMPTS.map(p => {
            if (editing) {
              const val = draft.sharpen[p.key] || '';
              return (
                <div key={p.key} className={`st-prompt ${val.trim() ? 'filled' : ''} ${['broken','hardest','impact'].includes(p.key) ? 'full' : ''}`}>
                  <div className="st-prompt-label">
                    <span className="st-prompt-kicker">{p.kicker}</span>
                    <span>{p.label}</span>
                  </div>
                  <p className="st-prompt-help">{p.help}</p>
                  <textarea
                    className="st-prompt-input"
                    value={val}
                    onChange={e => setDraft(d => ({ ...d, sharpen: { ...d.sharpen, [p.key]: e.target.value } }))}
                    placeholder={p.placeholder}
                  />
                </div>
              );
            }
            return <SectionReadView key={p.key} prompt={p} value={story.sharpen[p.key]} />;
          })}
        </div>
      </section>

      {/* Footer */}
      <div className="st-foot">
        <div className="st-foot-left">
          <b>{filledCount}</b>/{PROMPTS.length} BEATS · <b>{wordCount}</b> WORDS
        </div>
        <div className="st-foot-actions">
          {editing ? (
            <>
              <button className="btn danger" onClick={handleDelete} disabled={deleting}>
                <ITrash size={12}/> {deleting ? 'Deleting…' : 'Delete'}
              </button>
              <button onClick={cancelEdit} style={{
                fontSize: 13, padding: '7px 16px',
                border: '1px solid var(--line)', borderRadius: 'var(--radius-full)',
                background: 'var(--paper)', color: 'var(--ink-3)', cursor: 'pointer',
              }}>
                Cancel
              </button>
              <button className="btn primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : <><ICheck size={13}/> Save</>}
              </button>
            </>
          ) : (
            <button className="btn danger" onClick={handleDelete} disabled={deleting}>
              <ITrash size={12}/> {deleting ? 'Deleting…' : 'Delete story'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const GOOGLE_SVG = (
  <svg width="16" height="16" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

function StoriesView() {
  const { storyList, fetchList, fetchStory, updateCache, addToList, removeFromList } = useStories();
  const [activeId, setActiveId] = useState(null);
  const [activeStory, setActiveStory] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingStory, setLoadingStory] = useState(false);
  const [adding, setAdding] = useState(false);
  const didInit = useRef(false);

  // Load list on first mount
  useEffect(() => {
    if (didInit.current || storyList !== null) {
      if (storyList && storyList.length > 0 && !activeId) {
        setActiveId(storyList[0].id);
      }
      return;
    }
    didInit.current = true;
    setLoadingList(true);
    fetchList()
      .then(list => { if (list.length > 0) setActiveId(list[0].id); })
      .finally(() => setLoadingList(false));
  }, [storyList, fetchList, activeId]);

  // Prefetch remaining stories in background after first story loads
  useEffect(() => {
    if (!storyList || !activeStory) return;
    const others = storyList.filter(s => s.id !== activeStory.id);
    others.forEach(s => fetchStory(s.id).catch(() => {}));
  }, [activeStory, storyList, fetchStory]);

  // Load full story when tab changes
  useEffect(() => {
    if (!activeId) return;
    setLoadingStory(true);
    fetchStory(activeId)
      .then(setActiveStory)
      .finally(() => setLoadingStory(false));
  }, [activeId, fetchStory]);

  async function handleAdd() {
    setAdding(true);
    try {
      const story = await createStory();
      addToList(story);
      setActiveId(story.id);
      setActiveStory(story);
    } finally {
      setAdding(false);
    }
  }

  function handleSaved(updated) {
    updateCache(updated);
    setActiveStory(updated);
  }

  function handleDeleted(id, seedStory) {
    removeFromList(id, seedStory);
    if (seedStory) {
      setActiveId(seedStory.id);
      setActiveStory(seedStory);
    } else {
      const remaining = storyList?.filter(s => s.id !== id) ?? [];
      if (remaining.length > 0) {
        setActiveId(remaining[0].id);
      }
    }
  }

  if (loadingList) {
    return <div style={{ padding: '96px 0', textAlign: 'center', fontSize: 14, color: 'var(--ink-4)' }}>Loading…</div>;
  }

  return (
    <div className="st-shell">
      <div className="st-head">
        <div>
          <div className="eyebrow">STORIES</div>
          <h1>Career stories, sharpened.</h1>
          <p>Capture the messy real version, then break it into the beats interviewers ask for.</p>
        </div>
        <div className="st-head-meta">
          <span><b>{storyList?.length ?? 0}</b> stor{storyList?.length === 1 ? 'y' : 'ies'}</span>
        </div>
      </div>

      <section className="st-primer">
        <div>
          <div className="eyebrow">HOW THIS WORKS</div>
          <h2>Your career story, structured for interviews.</h2>
          <p>Most TPMs walk into interviews with three good stories and freeze when the panel probes for specifics. Write the raw version once — then answer eight short prompts.</p>
        </div>
        <div className="st-primer-tracks">
          <div className="st-track">
            <div className="st-track-num">01</div>
            <div className="st-track-body"><b>Write it raw</b><span>Long-form, your own voice.</span></div>
          </div>
          <div className="st-track">
            <div className="st-track-num">02</div>
            <div className="st-track-body"><b>Sharpen the beats</b><span>Eight prompts map to what panels probe for.</span></div>
          </div>
          <div className="st-track">
            <div className="st-track-num">03</div>
            <div className="st-track-body"><b>Reuse across applications</b><span>Keep your stories here and pull the right one for each role you apply to.</span></div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="st-tabs" role="tablist">
        {(storyList ?? []).map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={s.id === activeId}
            className={`st-tab ${s.id === activeId ? 'on' : ''}`}
            onClick={() => setActiveId(s.id)}
          >
            <span className="st-tab-num">{String(i + 1).padStart(2, '0')}</span>
            <span>{s.title || 'Untitled'}</span>
            {s.filled_count === PROMPTS.length && <span className="st-tab-dot" title="All prompts filled"/>}
          </button>
        ))}
        <button className="st-tab-add" onClick={handleAdd} disabled={adding}>
          <IPlus size={14}/> {adding ? 'Adding…' : 'Add story'}
        </button>
      </div>

      {/* Content */}
      {loadingStory ? (
        <div style={{ padding: '64px 0', textAlign: 'center', fontSize: 14, color: 'var(--ink-4)' }}>Loading…</div>
      ) : activeStory ? (
        <StoryBody
          key={activeStory.id}
          story={activeStory}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      ) : null}
    </div>
  );
}

export default function StoriesPage() {
  useSEO({ title: 'Stories', description: 'Build and sharpen your TPM behavioral interview stories.' });
  const { user } = useAuth();

  if (user === undefined) return null;

  if (!user) {
    return (
      <div style={{ maxWidth: 480, margin: '96px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>Sign in to access Stories</div>
        <p style={{ fontSize: 13, color: 'var(--ink-4)', margin: '0 0 20px' }}>
          Build and sharpen your behavioral interview stories. Free with a Google account.
        </p>
        <a href={loginUrl()} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontSize: 13, fontWeight: 500, padding: '9px 20px',
          borderRadius: 'var(--radius-full)', border: '1px solid var(--line)',
          color: 'var(--ink-2)', textDecoration: 'none', background: 'var(--paper)',
        }}>
          {GOOGLE_SVG} Sign in with Google
        </a>
      </div>
    );
  }

  return <StoriesView />;
}
