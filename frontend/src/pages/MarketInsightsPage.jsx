import { useState, useEffect, useMemo } from 'react';
import useSEO from '../hooks/useSEO';
import { getMarketSummary, getMarketHeatmap, getWeeklySummary } from '../services/marketApi';

// ── Animation CSS ─────────────────────────────────────────────────────────────

const ANIM_STYLES = `
  @keyframes mi-rise {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes mi-spark-draw {
    to { stroke-dashoffset: 0; }
  }
  @keyframes mi-spark-dot {
    from { transform: scale(0); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }
  @keyframes mi-spark-ripple {
    0%   { transform: scale(0.6); opacity: 0.55; }
    100% { transform: scale(2.6); opacity: 0; }
  }
  @keyframes mi-spark-glow {
    0%,100% { filter: drop-shadow(0 0 0px currentColor); }
    50%      { filter: drop-shadow(0 0 3px currentColor); }
  }
  .mi-rise {
    opacity: 0;
    animation: mi-rise 600ms cubic-bezier(0.22,1,0.36,1) forwards;
    animation-delay: var(--mi-d, 0ms);
  }
  @media (prefers-reduced-motion: reduce) {
    .mi-rise { animation: none !important; opacity: 1 !important; }
  }
`;

// ── Count-up hook ─────────────────────────────────────────────────────────────

function useCountUp(target, { duration = 1100, delay = 0, trigger = 0 } = {}) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (typeof target !== 'number' || isNaN(target)) { setValue(target); return; }
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setValue(target); return; }
    let raf, startTs;
    const ease = t => 1 - Math.pow(1 - t, 3);
    const tick = ts => {
      if (startTs == null) startTs = ts;
      const elapsed = ts - startTs - delay;
      if (elapsed < 0) { raf = requestAnimationFrame(tick); return; }
      const t = Math.min(1, elapsed / duration);
      setValue(Math.round(target * ease(t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    setValue(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, trigger]);
  return value;
}

function CountUp({ value, delay = 0, trigger = 0 }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0, { delay, trigger });
  if (typeof value !== 'number') return <>{value}</>;
  return <>{animated.toLocaleString()}</>;
}

// ── Sparkline SVG ─────────────────────────────────────────────────────────────

function Sparkline({ data, color = '#22c55e', delay = 0, animKey = 0 }) {
  if (!data || data.length < 2) return <span style={{ color: 'var(--ink-4)' }}>—</span>;

  const values = data.map(d => d.openings);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const W = 80, H = 28, P = 2;

  const pts = values.map((v, i) => {
    const x = P + (i / (values.length - 1)) * (W - P * 2);
    const y = H - P - ((v - min) / range) * (H - P * 2);
    return [x, y];
  });

  const d = pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');

  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i-1][0], dy = pts[i][1] - pts[i-1][1];
    len += Math.sqrt(dx*dx + dy*dy);
  }

  const last = pts[pts.length - 1];
  const lineDur = 900, stepDur = 70;

  return (
    <svg key={animKey} width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      <path
        d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        style={{
          strokeDasharray: len,
          strokeDashoffset: len,
          animation: `mi-spark-draw 900ms cubic-bezier(0.22,1,0.36,1) ${delay}ms forwards`,
        }}
      />
      {pts.slice(0, -1).map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="1.5"
          fill="var(--paper)" stroke={color} strokeWidth="1.25"
          style={{
            transformOrigin: 'center', transformBox: 'fill-box',
            opacity: 0,
            animation: `mi-spark-dot 320ms cubic-bezier(0.34,1.56,0.64,1) ${delay + lineDur * 0.55 + i * stepDur}ms forwards`,
          }}
        />
      ))}
      <circle cx={last[0]} cy={last[1]} r="3"
        fill="none" stroke={color} strokeWidth="1"
        style={{
          transformOrigin: 'center', transformBox: 'fill-box',
          opacity: 0, color,
          animation: `mi-spark-ripple 1500ms ease-out ${delay + lineDur * 0.55 + (pts.length-1)*stepDur + 600}ms infinite`,
        }}
      />
      <circle cx={last[0]} cy={last[1]} r="2.4" fill={color}
        style={{
          transformOrigin: 'center', transformBox: 'fill-box',
          opacity: 0, color,
          animation: `mi-spark-dot 360ms cubic-bezier(0.34,1.56,0.64,1) ${delay + lineDur * 0.55 + (pts.length-1)*stepDur}ms forwards, mi-spark-glow 1500ms ease-out ${delay + lineDur * 0.55 + (pts.length-1)*stepDur + 600}ms infinite`,
        }}
      />
    </svg>
  );
}

// ── Demand bar ────────────────────────────────────────────────────────────────

function DemandBar({ pct, color = '#22c55e' }) {
  return (
    <div style={{ width: 80, height: 6, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, borderRadius: 3 }} />
    </div>
  );
}

// ── Headline cards ────────────────────────────────────────────────────────────

function HeadlineCard({ label, value, sub, subColor, delay = 0 }) {
  return (
    <div className="mi-rise" style={{
      '--mi-d': `${delay}ms`,
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      padding: '20px 24px',
      background: 'var(--paper)',
      flex: 1,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)', lineHeight: 1, marginBottom: 6 }}>
        {typeof value === 'number' ? <CountUp value={value} delay={delay + 60} /> : (value ?? '—')}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: subColor ?? 'var(--ink-4)', fontWeight: 500 }}>{sub}</div>
      )}
    </div>
  );
}

function HeadlineCards({ summary }) {
  if (!summary) return null;

  const trendColor = (pct) => pct > 0 ? '#22c55e' : pct < 0 ? 'var(--danger)' : 'var(--ink-4)';
  const trendLabel = (pct) => pct == null ? null : `${pct > 0 ? '+' : ''}${pct}% overall trend`;

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
      <HeadlineCard label="Live TPM openings" value={summary.total_openings} sub="All sectors · London" delay={0} />
      <HeadlineCard label="Infrastructure" value={summary.by_sector?.['Infrastructure'] ?? 0} sub="Cloud, DC, networks" delay={90} />
      <HeadlineCard label="Cybersecurity" value={summary.by_sector?.['Cybersecurity'] ?? 0} sub="SecOps, GRC, identity" delay={180} />
      <HeadlineCard label="AI / ML" value={summary.by_sector?.['AI / ML'] ?? 0} sub="LLM infra, MLOps" delay={270} />
      {summary.hottest_sector && (
        <HeadlineCard
          label="Hottest sector"
          value={summary.hottest_sector}
          sub={trendLabel(summary.hottest_trend_pct)}
          subColor={trendColor(summary.hottest_trend_pct)}
        />
      )}
      {summary.cooling_sector && (
        <HeadlineCard
          label="Cooling sector"
          value={summary.cooling_sector}
          sub={trendLabel(summary.cooling_trend_pct)}
          subColor={trendColor(summary.cooling_trend_pct)}
        />
      )}
    </div>
  );
}

// ── Heatmap table ─────────────────────────────────────────────────────────────

const DIRECTION_CONFIG = {
  growing:   { label: '▲', color: '#22c55e' },
  shrinking: { label: '▼', color: 'var(--danger)' },
  stable:    { label: '—', color: 'var(--ink-4)' },
};

function HeatmapTable({ rows, loading }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('openings');

  if (loading) {
    return <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 14, color: 'var(--ink-4)' }}>Loading…</div>;
  }

  if (!rows || rows.length === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 14, color: 'var(--ink-4)' }}>
        No sector data available yet. Jobs are being classified.
      </div>
    );
  }

  let filtered = rows;
  if (filter === 'growing') filtered = rows.filter(r => r.direction === 'growing');
  if (filter === 'shrinking') filtered = rows.filter(r => r.direction === 'shrinking');

  const sorted = [...filtered].sort((a, b) =>
    sortBy === 'openings'
      ? b.latest_openings - a.latest_openings
      : b.overall_trend_pct - a.overall_trend_pct
  );

  const FILTERS = [
    { key: 'all', label: 'All sectors' },
    { key: 'growing', label: 'Growing only' },
    { key: 'shrinking', label: 'Shrinking only' },
  ];

  return (
    <div>
      {/* Filter + sort controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                fontSize: 12, fontWeight: 500, padding: '5px 14px',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${filter === f.key ? 'var(--accent)' : 'var(--line)'}`,
                color: filter === f.key ? 'var(--accent)' : 'var(--ink-3)',
                background: filter === f.key ? 'var(--accent-wash)' : 'var(--paper)',
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['openings', 'trend'].map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              style={{
                fontSize: 12, fontWeight: 500, padding: '5px 14px',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${sortBy === s ? 'var(--accent)' : 'var(--line)'}`,
                color: sortBy === s ? 'var(--accent)' : 'var(--ink-3)',
                background: sortBy === s ? 'var(--accent-wash)' : 'var(--paper)',
                cursor: 'pointer',
              }}
            >
              Sort: {s}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 11, color: 'var(--ink-4)' }}>
        <span><span style={{ color: '#22c55e' }}>▲</span> Growing</span>
        <span><span style={{ color: 'var(--danger)' }}>▼</span> Shrinking</span>
        <span>— Stable</span>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 100px 120px 100px 80px 80px',
          gap: 0, padding: '10px 20px',
          background: 'var(--paper-2)',
          borderBottom: '1px solid var(--line)',
          fontSize: 11, fontWeight: 600, color: 'var(--ink-4)',
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          <span>Sector</span>
          <span style={{ textAlign: 'right' }}>Openings</span>
          <span style={{ textAlign: 'right' }}>WoW change</span>
          <span style={{ textAlign: 'center' }}>Trend</span>
          <span style={{ textAlign: 'center' }}>Sparkline</span>
          <span style={{ textAlign: 'center' }}>Demand</span>
        </div>

        {/* Rows */}
        {sorted.map((row, i) => {
          const dir = DIRECTION_CONFIG[row.direction] ?? DIRECTION_CONFIG.stable;
          const wowColor = row.week_on_week_pct > 0 ? '#22c55e' : row.week_on_week_pct < 0 ? 'var(--danger)' : 'var(--ink-4)';

          const rowDelay = 200 + i * 50;
          return (
            <div
              key={row.name}
              className="mi-rise"
              style={{
                '--mi-d': `${rowDelay}ms`,
                display: 'grid',
                gridTemplateColumns: '2fr 100px 120px 100px 80px 80px',
                gap: 0, padding: '14px 20px',
                borderBottom: i < sorted.length - 1 ? '1px solid var(--line)' : 'none',
                background: 'var(--paper)',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{row.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>{row.subtitle}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
                <CountUp value={row.latest_openings} delay={rowDelay + 100} />
              </div>
              <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 600, color: wowColor }}>
                {row.week_on_week_pct > 0 ? '+' : ''}{row.week_on_week_pct}%
                <div style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 400 }}>
                  vs {row.previous_openings.toLocaleString()} prev week
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: dir.color }}>
                {row.overall_trend_pct > 0 ? '+' : ''}{row.overall_trend_pct}% {dir.label}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', paddingRight: 16 }}>
                <Sparkline data={row.weekly_data} color={dir.color} delay={rowDelay + 150} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', paddingLeft: 16 }}>
                <DemandBar pct={row.demand_pct} color={dir.color} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MarketInsightsPage() {
  useSEO({ title: 'Market Insights', description: 'London TPM job market — sector trends, weekly heatmap and demand signals.' });

  const [summary, setSummary] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingHeatmap, setLoadingHeatmap] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch both APIs in parallel
    getMarketSummary()
      .then(setSummary)
      .catch(() => setError('Failed to load market data'))
      .finally(() => setLoadingSummary(false));

    getMarketHeatmap()
      .then(setHeatmap)
      .catch(() => {})
      .finally(() => setLoadingHeatmap(false));

    getWeeklySummary()
      .then(setWeeklySummary)
      .catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '64px var(--s-9) 96px' }}>
      <style>{ANIM_STYLES}</style>
      <div className="eyebrow" style={{ marginBottom: 10 }}>MARKET INSIGHTS</div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ margin: 0 }}>London TPM job market.</h1>
        {summary?.updated_at && (
          <div style={{ fontSize: 12, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>
            Updated weekly · {summary.updated_at}
          </div>
        )}
      </div>
      <p style={{ fontSize: 15, color: 'var(--ink-3)', marginBottom: 40 }}>
        Weekly signals across London TPM roles — sector trends, openings and demand.
      </p>

      {error ? (
        <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>
      ) : loadingSummary ? (
        <p style={{ fontSize: 14, color: 'var(--ink-4)' }}>Loading…</p>
      ) : (
        <HeadlineCards summary={summary} />
      )}

      {/* Weekly AI Summary */}
      {weeklySummary && (
        <div style={{
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-md)',
          padding: '24px 28px',
          background: 'var(--paper)',
          marginBottom: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="eyebrow" style={{ margin: 0 }}>WEEKLY ANALYST SUMMARY</div>
              {weeklySummary.headline_sector && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 'var(--radius-full)', background: 'var(--verified-wash)', color: 'var(--verified)' }}>
                  {weeklySummary.headline_sector}
                </span>
              )}
            </div>
            <span style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>
              Week of {weeklySummary.week_start}
            </span>
          </div>
          {weeklySummary.headline_signal && (
            <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500, marginBottom: 14, fontStyle: 'italic' }}>
              {weeklySummary.headline_signal}
            </div>
          )}
          <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--ink-2)', margin: 0, whiteSpace: 'pre-line' }}>
            {weeklySummary.summary_text}
          </p>
          <div style={{ marginTop: 16, fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>
            Generated by {weeklySummary.model}
          </div>
        </div>
      )}

      <div className="eyebrow" style={{ marginBottom: 16 }}>SECTOR HEAT MAP</div>
      <HeatmapTable rows={heatmap} loading={loadingHeatmap} />
    </div>
  );
}
