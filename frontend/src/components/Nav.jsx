import { Icon } from './Icon';

const NAV_ITEMS = [
  { id: 'jobs', label: 'Jobs' },
  { id: 'sources', label: 'Sources' },
  { id: 'saved', label: 'Saved' },
  { id: 'about', label: 'About' },
];

export default function Nav({ view, setView }) {
  return (
    <header className="nav">
      <a className="brand" onClick={() => setView('jobs')}>
        <img src="/logo-mark.svg" alt="TPMguild"/>
        <span>TPMguild</span>
      </a>
      <nav className="menu">
        {NAV_ITEMS.map(i => (
          <a key={i.id} className={view === i.id ? 'active' : ''} onClick={() => setView(i.id)}>
            {i.label}
          </a>
        ))}
      </nav>
      <div className="spacer"/>
    </header>
  );
}
