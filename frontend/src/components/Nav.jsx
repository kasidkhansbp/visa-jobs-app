import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/jobs',     label: 'Jobs' },
  { path: '/sponsors', label: 'Sponsors' },
  { path: '/sources',  label: 'Sources' },
  { path: '/about',    label: 'About' },
];

export default function Nav() {
  const { pathname } = useLocation();

  return (
    <header className="nav">
      <Link className="brand" to="/jobs">
        <img src="/logo-mark.svg" alt="TPMguild"/>
        <span>TPMguild</span>
      </Link>
      <nav className="menu">
        {NAV_ITEMS.map(i => (
          <Link key={i.path} to={i.path} className={pathname === i.path || (i.path === '/jobs' && pathname === '/') ? 'active' : ''}>
            {i.label}
          </Link>
        ))}
      </nav>
      <div className="spacer"/>
    </header>
  );
}
