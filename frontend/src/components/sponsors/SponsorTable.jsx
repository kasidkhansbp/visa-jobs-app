import { useState, useCallback } from 'react';
import { useSponsors } from '../../hooks/useSponsors';

function Icon({ name }) {
  const p = { width: 15, height: 15, viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5', strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (name === 'search')  return <svg {...p}><circle cx="9" cy="9" r="5.5"/><path d="M13 13 L17 17"/></svg>;
  if (name === 'chev')    return <svg {...p}><path d="M5 8 L10 13 L15 8"/></svg>;
  if (name === 'prev')    return <svg {...p}><path d="M17 10 L3 10"/><path d="M8 5 L3 10 L8 15"/></svg>;
  if (name === 'next')    return <svg {...p}><path d="M3 10 L17 10"/><path d="M12 5 L17 10 L12 15"/></svg>;
  return null;
}

const ROUTES = [
  'Skilled Worker',
  'Global Business Mobility: Senior or Specialist Worker',
  'Tier 2 Ministers of Religion',
  'Creative Worker',
  'Charity Worker',
  'International Sportsperson',
  'Religious Worker',
  'Global Business Mobility: Graduate Trainee',
  'Global Business Mobility: UK Expansion Worker',
  'Government Authorised Exchange',
  'International Agreement',
  'Scale-up',
  'Global Business Mobility: Service Supplier',
  'Seasonal Worker',
  'Global Business Mobility: Secondment Worker',
  'Intra Company Transfers (ICT)',
  'Intra-company Routes',
];

const PAGE_SIZE = 20;

export default function SponsorTable() {
  const [q, setQ]         = useState('');
  const [route, setRoute] = useState('');
  const [rating, setRating] = useState('');
  const [page, setPage]   = useState(1);

  const [search, setSearch] = useState('');

  const { data, isLoading } = useSponsors({
    q: search, route, rating, page, pageSize: PAGE_SIZE,
  });

  const handleSearch = useCallback(e => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <section style={{ marginTop: 32 }}>
      <div className="eyebrow" style={{ marginBottom: 10 }}>Search &amp; Browse Sponsors</div>

      <div className="sr-controls">
        <div className="sr-input">
          <Icon name="search" />
          <input
            value={q}
            onChange={e => { setQ(e.target.value); handleSearch(e); }}
            placeholder="Search organisation name..."
          />
        </div>
        <div className="sr-select">
          <select value={route} onChange={e => { setRoute(e.target.value); setPage(1); }}>
            <option value="">All routes</option>
            {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <Icon name="chev" />
        </div>
        <div className="sr-select">
          <select value={rating} onChange={e => { setRating(e.target.value); setPage(1); }}>
            <option value="">All ratings</option>
            <option value="A">A rated</option>
            <option value="B">B rated</option>
          </select>
          <Icon name="chev" />
        </div>
      </div>

      <table className="sr-table">
        <thead>
          <tr>
            <th>Organisation</th>
            <th>City</th>
            <th>County</th>
            <th>Route</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr className="sr-empty-row">
              <td colSpan="5">Loading sponsors...</td>
            </tr>
          ) : data?.results?.length === 0 ? (
            <tr className="sr-empty-row">
              <td colSpan="5">No sponsors match these filters.</td>
            </tr>
          ) : (
            data?.results?.map((s, i) => (
              <tr key={i}>
                <td className="sr-name" title={s.organisation_name}>
                  {s.organisation_name.length > 40 ? s.organisation_name.slice(0, 40) + '…' : s.organisation_name}
                </td>
                <td>{s.town ?? '—'}</td>
                <td className="sr-dim">{s.county ?? '—'}</td>
                <td title={s.route}>
                  {s.route.length > 28 ? s.route.slice(0, 28) + '…' : s.route}
                </td>
                <td>
                  {s.rating ? (
                    <span className={`sr-chip ${s.rating.toLowerCase()}`}>
                      <span className="sr-chip-dot" />
                      {s.rating_raw ?? `${s.rating} rated`}
                    </span>
                  ) : '—'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="sr-pager">
        <button className="sr-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
          <Icon name="prev" /> Prev
        </button>
        <span className="sr-pager-info">Page {page} of {totalPages}</span>
        <button className="sr-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
          Next <Icon name="next" />
        </button>
        <span className="sr-pager-total">
          {data?.total?.toLocaleString() ?? '—'} results (register has {data?.total?.toLocaleString() ?? '—'} entries)
        </span>
      </div>
    </section>
  );
}
