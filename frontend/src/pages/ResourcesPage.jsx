const GPT_TOOLS = [
  {
    name: 'TPM One-Pager',
    description: 'Generate a crisp one-page project overview. Drop in your project details and get a structured summary ready to share with stakeholders.',
    url: 'https://chatgpt.com/g/g-68967128e1e8819190f9f40a1b4ef8a7-tpm-one-pager',
    tag: 'Generator',
  },
  {
    name: 'PR/FAQ',
    description: 'Write an Amazon-style PR/FAQ for any initiative. Start with the press release, work backwards to the requirements.',
    url: 'https://chatgpt.com/g/g-689afc653474819181594abd5737a107-prfaq',
    tag: 'Generator',
  },
  {
    name: 'Doc Reviewer',
    description: 'Paste any TPM document and get structured feedback on clarity, completeness, and stakeholder readiness.',
    url: 'https://chatgpt.com/g/g-68abf595c7a48191beab667640a1f84a-docreviewer',
    tag: 'Reviewer',
  },
];

function ToolCard({ tool }) {
  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none' }}
    >
      <div style={{
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        padding: '24px 28px',
        background: 'var(--paper)',
        cursor: 'pointer',
        transition: 'border-color 120ms ease',
        height: '100%',
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--ink)' }}>{tool.name}</div>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--accent-wash)',
            color: 'var(--accent)',
          }}>
            {tool.tag}
          </span>
        </div>
        <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.65 }}>
          {tool.description}
        </p>
        <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>
          Open in ChatGPT →
        </div>
      </div>
    </a>
  );
}

export default function ResourcesPage() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '64px 56px' }}>
      <div className="eyebrow" style={{ marginBottom: 10 }}>TPM Toolkit</div>
      <h1 style={{ margin: '0 0 16px' }}>Tools built for TPMs.</h1>
      <p style={{ fontSize: 17, color: 'var(--ink-3)', maxWidth: 600, marginBottom: 48 }}>
        A collection of AI-powered tools to help you write better documents,
        communicate more clearly, and move faster.
      </p>

      <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
        AI Assistants
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 56 }}>
        {GPT_TOOLS.map(tool => (
          <ToolCard key={tool.name} tool={tool} />
        ))}
      </div>

      <div style={{
        padding: '20px 24px',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        background: 'var(--paper)',
        fontSize: 14,
        color: 'var(--ink-3)',
      }}>
        More tools coming soon. Have a suggestion? Email <a href="mailto:kasidkhan@tpmguild.com" style={{ color: 'var(--accent)' }}>kasidkhan@tpmguild.com</a>
      </div>
    </div>
  );
}
