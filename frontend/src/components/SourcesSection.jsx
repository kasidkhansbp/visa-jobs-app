const SOURCES = [
  {
    name: 'Adzuna',
    desc: 'UK-focused jobs aggregator. Good coverage of startups and tech-first employers.',
    updated: 'Daily',
  },
  {
    name: 'Reed',
    desc: 'Long-established UK jobs board. Strong on enterprise and regulated industries.',
    updated: 'Daily',
  },
  {
    name: 'Home Office',
    desc: 'Register of licensed Skilled Worker sponsors. The ground truth we filter against.',
    count: '81,204+',
    updated: 'Daily',
  },
  {
    name: 'Companies House',
    desc: 'Resolves trading names vs legal entities so sponsor matches are precise.',
    count: '—',
    updated: 'On demand',
  },
];

export default function SourcesSection() {
  return (
    <section className="sources-grid">
      <div className="eyebrow">DATA SOURCES</div>
      <h2>Four sources, one guarantee.</h2>
      <div className="grid">
        {SOURCES.map(s => (
          <div key={s.name} className="source-card">
            <div className="name">{s.name}</div>
            <div className="desc">{s.desc}</div>
            {s.count && (
              <div className="stat">
                <span className="k">Records</span>
                <span>{s.count}</span>
              </div>
            )}
            <div className="stat">
              <span className="k">Updated</span>
              <span>{s.updated}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
