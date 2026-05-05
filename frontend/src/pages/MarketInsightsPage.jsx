import { useState, useEffect } from 'react';
import useSEO from '../hooks/useSEO';
import { getMarketSummary, getMarketHeatmap } from '../services/marketApi';

// ── Sparkline SVG ─────────────────────────────────────────────────────────────

function Sparkline({ data, color = '#22c55e' }) {
  if (!data || data.length < 2) return <span style={{ color: 'var(--ink-4)' }}>—</span>;

  const values = data.map(d => d.openings);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const W = 80;
  const H = 28;
  const pad = 2;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v - min) / range) * (H - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
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

function HeadlineCard({ label, value, sub, subColor }) {
  return (
    <div style={{
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
        {value ?? '—'}
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
      <HeadlineCard
        label="Live TPM openings"
        value={summary.total_openings?.toLocaleString()}
        sub="All sectors · London"
      />
      <HeadlineCard
        label="Infrastructure"
        value={summary.by_sector?.['Infrastructure'] ?? 0}
        sub="Cloud, DC, networks"
      />
      <HeadlineCard
        label="Cybersecurity"
        value={summary.by_sector?.['Cybersecurity'] ?? 0}
        sub="SecOps, GRC, identity"
      />
      <HeadlineCard
        label="AI / ML"
        value={summary.by_sector?.['AI / ML'] ?? 0}
        sub="LLM infra, MLOps"
      />
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

          return (
            <div
              key={row.name}
              style={{
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
                {row.latest_openings.toLocaleString()}
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
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Sparkline data={row.weekly_data} color={dir.color} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
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
  }, []);

  return (
    <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '64px var(--s-9) 96px' }}>
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

      <div className="eyebrow" style={{ marginBottom: 16 }}>SECTOR HEAT MAP</div>
      <HeatmapTable rows={heatmap} loading={loadingHeatmap} />
    </div>
  );
}
