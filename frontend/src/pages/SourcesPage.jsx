const COVERAGE = [
  { label: 'Job titles searched', value: 'Technical Program Manager, TPM, Technical Programme Manager' },
  { label: 'Locations covered', value: 'London, UK (expanding)' },
  { label: 'Sources', value: 'Adzuna, Reed' },
  { label: 'Refresh frequency', value: 'Daily' },
  { label: 'Sponsor register updated', value: 'Monthly (Home Office)' },
  { label: 'Jobs retained', value: 'Last 90 days' },
];

import useSEO from '../hooks/useSEO';

export default function SourcesPage() {
  useSEO({ title: 'Data Sources', description: 'TPMguild aggregates TPM jobs from Adzuna and Reed, cross-referenced daily against the UK Home Office Skilled Worker sponsor register.' });
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 56px' }}>
      <div className="eyebrow" style={{ marginBottom: 10 }}>Sources</div>
      <h1 style={{ margin: '0 0 16px' }}>Where the data comes from.</h1>
      <p style={{ fontSize: 17, color: 'var(--ink-3)', maxWidth: 640, marginBottom: 48 }}>
        Every job listing and every sponsor match is sourced from public APIs and official government data.
        No scraping, no guesswork.
      </p>

      <div style={{ marginBottom: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Data sources</div>
        <h2 style={{ margin: '0 0 24px', fontSize: 28 }}>Four sources, one guarantee.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[
            { name: 'Adzuna', desc: 'UK-focused jobs aggregator. Good coverage of startups and tech-first employers.', updated: 'Daily' },
            { name: 'Reed', desc: 'Long-established UK jobs board. Strong on enterprise and regulated industries.', updated: 'Daily' },
            { name: 'Home Office', desc: 'Register of licensed Skilled Worker sponsors. The ground truth we filter against.', count: '140,000+', updated: 'Monthly' },
            { name: 'Companies House', desc: 'Resolves trading names vs legal entities so sponsor matches are precise.', count: '—', updated: 'On demand' },
          ].map(s => (
            <div key={s.name} style={{
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              padding: '18px 20px',
              background: 'var(--paper)',
              fontSize: 14,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{s.name}</div>
              <div style={{ color: 'var(--ink-3)', marginBottom: 16, lineHeight: 1.55 }}>{s.desc}</div>
              {s.count && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-3)', marginBottom: 4 }}>
                  <span>Records</span><span style={{ color: 'var(--ink)' }}>{s.count}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-3)' }}>
                <span>Updated</span><span style={{ color: 'var(--ink)' }}>{s.updated}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 56 }}>
        <h2 style={{ margin: '0 0 24px', fontSize: 20 }}>Coverage details</h2>
        <div style={{
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          background: 'var(--paper)',
        }}>
          {COVERAGE.map((row, i) => (
            <div key={row.label} style={{
              display: 'grid',
              gridTemplateColumns: '240px 1fr',
              padding: '14px 20px',
              borderBottom: i < COVERAGE.length - 1 ? '1px solid var(--line)' : 'none',
              fontSize: 14,
            }}>
              <span style={{ color: 'var(--ink-3)', fontWeight: 500 }}>{row.label}</span>
              <span style={{ color: 'var(--ink)' }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
