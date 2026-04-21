export default function StatCards({ stats }) {
  const fmt = n => n ? n.toLocaleString() : '—';
  const pct = (a, b) => b ? `${((a / b) * 100).toFixed(1)}% of register` : '—';

  const cards = stats ? [
    { label: 'Total entries',        value: fmt(stats.total_entries),  sub: 'as of latest import' },
    { label: 'Unique organisations', value: fmt(stats.unique_orgs),    sub: 'licensed sponsors' },
    { label: 'A-rated sponsors',     value: fmt(stats.a_rated_count),  sub: pct(stats.a_rated_count, stats.total_entries) },
    { label: 'B-rated sponsors',     value: fmt(stats.b_rated_count),  sub: 'cannot hire new workers' },
  ] : Array(4).fill(null);

  return (
    <div className="sr-stats">
      {cards.map((card, i) => (
        <div key={i} className={`sr-stat${!card ? ' sr-stat-empty' : ''}`}>
          <div className="sr-stat-k">{card?.label ?? 'Loading...'}</div>
          <div className="sr-stat-v">{card?.value ?? '—'}</div>
          <div className="sr-stat-sub">{card?.sub ?? ''}</div>
        </div>
      ))}
    </div>
  );
}
