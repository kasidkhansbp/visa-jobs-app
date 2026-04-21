const ROUTE_COLORS = [
  '#2E3BE6', '#2F7A4F', '#B8621F', '#A8322C', '#6b5518',
  '#1a4434', '#6b2a25', '#8A8690', '#4a90d9', '#7b4fa6',
  '#c0843a', '#3a7a6b', '#b05090', '#5a6a2e', '#8a3a5a',
  '#3a5a8a', '#6a4a2e',
];

export default function RoutesDonut({ routes }) {
  if (!routes || routes.length === 0) {
    return (
      <section className="sr-panel">
        <div className="sr-panel-head">Visa routes</div>
        <div className="sr-empty">No data available</div>
      </section>
    );
  }

  const total = routes.reduce((s, r) => s + r.count, 0);
  const R = 60;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <section className="sr-panel">
      <div className="sr-panel-head">Visa routes</div>
      <div className="sr-donut-wrap">
        <svg width="160" height="160" viewBox="0 0 180 180" className="sr-donut">
          {routes.map((r, i) => {
            const len = (r.count / total) * C;
            const el = (
              <circle
                key={r.label}
                cx="90" cy="90" r={R}
                fill="none"
                stroke={ROUTE_COLORS[i % ROUTE_COLORS.length]}
                strokeWidth="28"
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <ul className="sr-legend">
          {routes.map((r, i) => (
            <li key={r.label}>
              <span className="sr-sw" style={{ background: ROUTE_COLORS[i % ROUTE_COLORS.length] }} />
              {r.label}
              <b>{((r.count / total) * 100).toFixed(1)}%</b>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
