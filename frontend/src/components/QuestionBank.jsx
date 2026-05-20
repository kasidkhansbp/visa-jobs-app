import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '../services/questionsApi';
import '../styles/resources.css';

const ADMIN_EMAIL = 'kasidkhan@gmail.com';

const SECTIONS = [
  { id: 'HR',                 num: '01', label: 'HR / Recruiter',    short: 'HR',      desc: 'Screening calls. They are clearing basic gates — fit, money, timing, visa — before anyone senior spends time on you.' },
  { id: 'HM',                 num: '02', label: 'Hiring Manager',    short: 'HM',      desc: 'Your future boss. They are deciding whether they want to work with you for the next three years. Substance matters more than polish.' },
  { id: 'Program Management', num: '03', label: 'Program Management',short: 'Prog Mgmt',desc: 'Craft questions. They want to hear how you actually run a program — cadence, artefacts, mechanisms — not what a textbook says.' },
  { id: 'Technical',          num: '04', label: 'Technical',         short: 'Technical',desc: 'You are not the SME and they know it. They are checking that you can hold your own with engineers without bluffing.' },
  { id: 'Behavioral',         num: '05', label: 'Behavioral',        short: 'Behavioral',desc: 'STAR territory. They are listening for self-awareness as much as outcomes.' },
];

const EMPTY_FORM = { category: 'HR', question: '', answer: '', order: 0 };

function SearchIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="5.5"/><path d="M13 13 L17 17"/>
    </svg>
  );
}

function QItem({ item, idx, open, onToggle, sectionLabel, isAdmin, onEdit, onDelete }) {
  const delay = Math.min(idx * 40, 280);
  return (
    <div className={`rs-qitem ${open ? 'open' : ''}`} style={{ '--d': `${delay}ms` }}>
      <button className="rs-qbtn" onClick={onToggle} aria-expanded={open}>
        <span className="rs-qnum">{String(idx + 1).padStart(2, '0')}</span>
        <span className="rs-qtext">{item.question}</span>
        <span className="rs-qicon" aria-hidden="true" />
      </button>
      <div className="rs-apanel">
        <div className="rs-awrap">
          <div className="rs-aninner">
            <div className="rs-atext">{item.answer}</div>
            <div className="rs-aside">
              {sectionLabel && (
                <>
                  <div className="rs-aside-label">Round</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{sectionLabel}</div>
                </>
              )}
              {isAdmin && (
                <>
                  <div className="rs-aside-label" style={{ marginTop: 'var(--s-3)' }}>Admin</div>
                  <div className="rs-admin-actions">
                    <button className="rs-admin-btn" onClick={() => onEdit(item)}>Edit</button>
                    <button className="rs-admin-btn danger" onClick={() => onDelete(item)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionModal({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const isEdit = !!initial?.id;

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }));
  }

  return (
    <div className="rs-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rs-modal">
        <h4>{isEdit ? 'Edit Question' : 'Add Question'}</h4>

        <div className="rs-modal-field">
          <label>Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}>
            {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>

        <div className="rs-modal-field">
          <label>Order</label>
          <input
            type="number"
            min={0}
            value={form.order}
            onChange={e => set('order', parseInt(e.target.value, 10) || 0)}
          />
        </div>

        <div className="rs-modal-field">
          <label>Question</label>
          <textarea
            rows={3}
            value={form.question}
            onChange={e => set('question', e.target.value)}
            placeholder="What does a TPM do, in your words?"
          />
        </div>

        <div className="rs-modal-field">
          <label>Answer</label>
          <textarea
            rows={8}
            value={form.answer}
            onChange={e => set('answer', e.target.value)}
            placeholder="The model answer..."
          />
        </div>

        <div className="rs-modal-actions">
          <button className="rs-modal-btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button
            className="rs-modal-btn primary"
            onClick={() => onSave(form)}
            disabled={saving || !form.question.trim() || !form.answer.trim()}
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add question'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuestionBank() {
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [active, setActive] = useState('HR');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);
  const [modal, setModal] = useState(null); // null | { mode: 'add' | 'edit', item?: {} }
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const data = await getQuestions();
      setSections(data);
    } catch {
      setError('Failed to load questions.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { setOpenId(null); }, [active, query]);

  const questionsByCategory = useMemo(() => {
    const map = {};
    sections.forEach(s => { map[s.category] = s.questions; });
    return map;
  }, [sections]);

  const totalCount = useMemo(() => sections.reduce((n, s) => n + s.questions.length, 0), [sections]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { mode: 'section', items: questionsByCategory[active] ?? [] };
    const matches = [];
    SECTIONS.forEach(s => {
      (questionsByCategory[s.id] ?? []).forEach((item, i) => {
        if ((item.question + ' ' + item.answer).toLowerCase().includes(q)) {
          matches.push({ ...item, _section: s, _idx: i });
        }
      });
    });
    return { mode: 'search', items: matches };
  }, [query, active, questionsByCategory]);

  async function handleSave(form) {
    setSaving(true);
    try {
      if (modal.item?.id) {
        await updateQuestion(modal.item.id, form);
      } else {
        await createQuestion(form);
      }
      await load();
      setModal(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Delete "${item.question}"?`)) return;
    try {
      await deleteQuestion(item.id);
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  const section = SECTIONS.find(s => s.id === active);

  if (loading) return (
    <div className="rs-shell">
      <div style={{ color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Loading questions…</div>
    </div>
  );

  if (error) return (
    <div className="rs-shell">
      <div style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</div>
    </div>
  );

  return (
    <div className="rs-shell">
      {/* Header */}
      <div className="rs-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 'var(--s-4)' }}>Interview Prep</div>
          <h2>What they <em>actually</em> ask.</h2>
          <p>A question bank for UK TPM interviews — five rounds, with answers written the way a senior TPM would answer them in the room.</p>
        </div>
        <div className="rs-head-meta">
          <b>{totalCount}</b> Questions · 5 Rounds
          {isAdmin && (
            <div style={{ marginTop: 'var(--s-3)' }}>
              <button
                className="rs-modal-btn primary"
                style={{ fontSize: 12, padding: '6px 12px' }}
                onClick={() => setModal({ mode: 'add' })}
              >
                + Add Question
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="rs-search">
        <SearchIcon />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search across all rounds — e.g. 'scope', 'visa', 'incident'"
        />
        {query && (
          <span className="rs-search-meta">{filtered.items.length} match{filtered.items.length === 1 ? '' : 'es'}</span>
        )}
      </div>

      {/* Layout */}
      <div className="rs-layout">
        {/* Sidebar nav */}
        <nav className="rs-nav" aria-label="Interview rounds">
          <div className="rs-nav-label">Rounds</div>
          <div className="rs-nav-list">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                className={`rs-nav-item ${active === s.id && !query ? 'on' : ''}`}
                onClick={() => { setActive(s.id); setQuery(''); }}
              >
                <span><span className="rs-nav-num">{s.num}</span>{s.short}</span>
                <span className="rs-nav-count">{(questionsByCategory[s.id] ?? []).length}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main content */}
        <main>
          {filtered.mode === 'section' ? (
            <>
              <header className="rs-section-head" key={active}>
                <div className="rs-section-num">Round {section.num} · {section.label.toUpperCase()}</div>
                <h3>{section.label}</h3>
                <p>{section.desc}</p>
              </header>
              {filtered.items.length === 0 ? (
                <div className="rs-empty">No questions yet in this round.{isAdmin && ' Add one above.'}</div>
              ) : (
                <div className="rs-qlist">
                  {filtered.items.map((item, i) => (
                    <QItem
                      key={item.id}
                      idx={i}
                      item={item}
                      open={openId === item.id}
                      onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                      isAdmin={isAdmin}
                      onEdit={it => setModal({ mode: 'edit', item: it })}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <header className="rs-section-head">
                <div className="rs-section-num">Search Results · "{query}"</div>
                <h3>{filtered.items.length} question{filtered.items.length === 1 ? '' : 's'} match.</h3>
                <p>Across all five rounds. Clear the search to browse a single round.</p>
              </header>
              {filtered.items.length === 0 ? (
                <div className="rs-empty">No questions match <b>"{query}"</b>. Try a shorter term.</div>
              ) : (
                <div className="rs-qlist">
                  {filtered.items.map((item, i) => (
                    <QItem
                      key={item.id}
                      idx={i}
                      item={item}
                      open={openId === item.id}
                      onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                      sectionLabel={item._section?.short}
                      isAdmin={isAdmin}
                      onEdit={it => setModal({ mode: 'edit', item: it })}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Admin modal */}
      {modal && (
        <QuestionModal
          initial={modal.item ? { ...modal.item } : undefined}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}
    </div>
  );
}
