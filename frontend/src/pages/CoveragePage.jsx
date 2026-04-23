const WHAT_WE_COVER = [
  { label: 'Job titles', value: 'Technical Program Manager, TPM, Technical Programme Manager' },
  { label: 'Locations', value: 'London, UK (more cities coming soon)' },
  { label: 'Job sources', value: 'Adzuna, Reed' },
  { label: 'Refresh frequency', value: 'Daily' },
  { label: 'Jobs retained', value: 'Last 90 days' },
  { label: 'Sponsor register', value: '140,000+ licensed UK sponsors (Home Office, updated monthly)' },
];

const LIMITATIONS = [
  {
    title: 'Not every TPM job is listed',
    body: 'We only fetch from Adzuna and Reed. Jobs posted exclusively on LinkedIn, company career pages, or other boards are not included.',
  },
  {
    title: 'Sponsor status is not a hiring guarantee',
    body: 'A Sponsor-verified label means the employer holds a valid Skilled Worker sponsor licence. It does not mean they are actively offering sponsorship for every role. Always confirm with the employer.',
  },
  {
    title: 'Name matching is approximate',
    body: 'We match employer names against the sponsor register using normalisation. In rare cases a company may be missed due to trading name differences or spelling variations.',
  },
  {
    title: 'London only for now',
    body: 'We currently focus on London-based roles. Coverage will expand to other UK cities in a future update.',
  },
];

function Table({ rows }) {
  return (
    <div style={{
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      background: 'var(--paper)',
    }}>
      {rows.map((row, i) => (
        <div key={row.label} style={{
          display: 'grid',
          gridTemplateColumns: '220px 1fr',
          padding: '14px 20px',
          borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 'none',
          fontSize: 14,
        }}>
          <span style={{ color: 'var(--ink-3)', fontWeight: 500 }}>{row.label}</span>
          <span style={{ color: 'var(--ink)' }}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function CoveragePage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '64px 56px' }}>
      <div className="eyebrow" style={{ marginBottom: 10 }}>Coverage</div>
      <h1 style={{ margin: '0 0 16px' }}>What we cover and what we do not.</h1>
      <p style={{ fontSize: 17, color: 'var(--ink-3)', maxWidth: 600, marginBottom: 48 }}>
        TPMguild is focused and intentionally narrow. Here is exactly what is included,
        and where the gaps are.
      </p>

      <h2 style={{ margin: '0 0 16px', fontSize: 20 }}>What we cover</h2>
      <Table rows={WHAT_WE_COVER} />

      <h2 style={{ margin: '48px 0 16px', fontSize: 20 }}>Known limitations</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {LIMITATIONS.map(item => (
          <div key={item.title} style={{
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: '18px 20px',
            background: 'var(--paper)',
          }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{item.title}</div>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.65 }}>{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
