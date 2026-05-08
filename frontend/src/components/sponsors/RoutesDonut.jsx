import { useState } from 'react';

const ROUTE_COLORS = [
  '#2E3BE6', '#2F7A4F', '#B8621F', '#A8322C', '#6b5518',
  '#1a4434', '#6b2a25', '#8A8690', '#4a90d9', '#7b4fa6',
  '#c0843a', '#3a7a6b', '#b05090', '#5a6a2e', '#8a3a5a',
  '#3a5a8a', '#6a4a2e',
];

export default function RoutesDonut({ routes }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

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
  const R_HOVERED = 68;
  const C = 2 * Math.PI * R;
  const C_HOVERED = 2 * Math.PI * R_HOVERED;
  let offset = 0;

  // Pre-calculate offsets
  const segments = routes.map((r, i) => {
    const len = (r.count / total) * C;
    const lenH = (r.count / total) * C_HOVERED;
    const seg = { r, i, len, lenH, offset, offsetH: offset * (C_HOVERED / C) };
    offset += len;
    return seg;
  });

  return (
    <section className="sr-panel">
      <div className="sr-panel-head">Visa routes</div>
      <div className="sr-donut-wrap">
        <svg width="160" height="160" viewBox="0 0 180 180" className="sr-donut">
          {segments.map(({ r, i, len, lenH, offset: segOffset, offsetH }) => {
            const isHovered = hoveredIndex === i;
            const radius = isHovered ? R_HOVERED : R;
            const segLen = isHovered ? lenH : len;
            const segC = 2 * Math.PI * radius;
            const segOffset2 = isHovered ? -offsetH : -segOffset;

            return (
              <circle
                key={r.label}
                cx="90" cy="90"
                r={radius}
                fill="none"
                stroke={ROUTE_COLORS[i % ROUTE_COLORS.length]}
                strokeWidth={isHovered ? 34 : 28}
                strokeDasharray={`${segLen} ${segC - segLen}`}
                strokeDashoffset={segOffset2}
                style={{
                  transition: 'r 200ms ease, stroke-width 200ms ease, stroke-dasharray 200ms ease, stroke-dashoffset 200ms ease',
                  cursor: 'pointer',
                  filter: isHovered ? `drop-shadow(0 0 6px ${ROUTE_COLORS[i % ROUTE_COLORS.length]}88)` : 'none',
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
          {/* Label in centre on hover */}
          {hoveredIndex !== null && (
            <>
              <text x="90" y="85" textAnchor="middle" fontSize="11" fill="var(--ink-3)" fontFamily="var(--font-mono)">
                {routes[hoveredIndex].label.length > 12
                  ? routes[hoveredIndex].label.slice(0, 12) + '…'
                  : routes[hoveredIndex].label}
              </text>
              <text x="90" y="102" textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--ink)" fontFamily="var(--font-display)">
                {((routes[hoveredIndex].count / total) * 100).toFixed(1)}%
              </text>
            </>
          )}
        </svg>
        <ul className="sr-legend">
          {routes.map((r, i) => (
            <li
              key={r.label}
              style={{
                cursor: 'pointer',
                opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.4,
                transition: 'opacity 150ms ease',
                fontWeight: hoveredIndex === i ? 600 : 400,
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
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
