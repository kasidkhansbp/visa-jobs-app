export default function ActiveSponsors({ active, onFilter }) {
  const items = [
    { label: '2+ routes', key: 'routes_2plus', value: 2 },
    { label: '3+ routes', key: 'routes_3plus', value: 3 },
    { label: '4+ routes', key: 'routes_4plus', value: 4 },
    { label: '5+ routes', key: 'routes_5plus', value: 5 },
    { label: '6+ routes', key: 'routes_6plus', value: 6 },
  ];

  const fmt = n => n != null ? n.toLocaleString() : '—';

  return (
    <div className="sr-active-sponsors">
      <div className="sr-active-head">
        <span className="eyebrow">Active sponsors by route coverage</span>
        <span className="sr-active-hint">Click to filter table</span>
      </div>
      <div className="sr-active-row">
        {items.map(item => (
          <button
            key={item.key}
            className="sr-active-card"
            onClick={() => onFilter(item.value)}
            title={`Show sponsors with ${item.label}`}
          >
            <div className="sr-active-v">{fmt(active?.[item.key])}</div>
            <div className="sr-active-label">{item.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
