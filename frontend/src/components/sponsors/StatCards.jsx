import { useState, useEffect } from 'react';

// ── Count-up hook ─────────────────────────────────────────────────────────────
function useCountUp(target, { duration = 1200, delay = 0 } = {}) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (typeof target !== 'number' || isNaN(target)) return;
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
  }, [target, delay]);
  return value;
}

function AnimatedNumber({ raw, formatted, delay }) {
  const animated = useCountUp(raw, { delay });
  if (raw == null) return <>{formatted}</>;
  return <>{animated.toLocaleString()}</>;
}

export default function StatCards({ stats }) {
  const fmt = n => n ? n.toLocaleString() : '—';
  const pct = (a, b) => b ? `${((a / b) * 100).toFixed(1)}% of register` : '—';

  const cards = stats ? [
    { label: 'Total entries',        raw: stats.total_entries,  value: fmt(stats.total_entries),  sub: 'as of latest import' },
    { label: 'Unique organisations', raw: stats.unique_orgs,    value: fmt(stats.unique_orgs),    sub: 'licensed sponsors' },
    { label: 'A-rated sponsors',     raw: stats.a_rated_count,  value: fmt(stats.a_rated_count),  sub: pct(stats.a_rated_count, stats.total_entries) },
    { label: 'B-rated sponsors',     raw: stats.b_rated_count,  value: fmt(stats.b_rated_count),  sub: 'cannot hire new workers' },
  ] : Array(4).fill(null);

  return (
    <div className="sr-stats">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`sr-stat${!card ? ' sr-stat-empty' : ''} sr-anim-rise`}
          style={{ '--sr-d': `${i * 80}ms` }}
        >
          <div className="sr-stat-k">{card?.label ?? 'Loading...'}</div>
          <div className="sr-stat-v">
            {card
              ? <AnimatedNumber raw={card.raw} formatted={card.value} delay={i * 80 + 100} />
              : '—'}
          </div>
          <div className="sr-stat-sub">{card?.sub ?? ''}</div>
        </div>
      ))}
    </div>
  );
}
