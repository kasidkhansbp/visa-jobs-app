import useSEO from '../hooks/useSEO';
import PageLayout from '../components/PageLayout';

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

const TEMPLATES = [
  {
    name: 'RAID Log',
    description: 'Track Risks, Assumptions, Issues, and Dependencies across your programme in one structured log.',
    url: 'https://docs.google.com/spreadsheets/d/1ImiTPpkbnn-9STVUnIkhRDdLaqSZO-ukcewFVxq9Us8/edit?gid=0#gid=0',
    tag: 'Spreadsheet',
  },
  {
    name: 'Weekly Report',
    description: 'A consistent weekly status report template to keep stakeholders informed and aligned.',
    url: 'https://docs.google.com/document/d/1jijavUjNwD0G0pg83GJu8LoMBbRG2fhvmqr213A9smU/edit?tab=t.0',
    tag: 'Document',
  },
  {
    name: 'Program Plan',
    description: 'Structure your programme timeline, milestones, and ownership in a shareable plan.',
    url: 'https://docs.google.com/document/d/1b22vogSfE5ZKdhRE79SM2jmKDSWwbkLRhIjPPoDG1ZE/edit?tab=t.0',
    tag: 'Document',
  },
  {
    name: 'Program Alignment',
    description: 'Capture programme goals, stakeholders, and decisions to drive alignment across teams.',
    url: 'https://docs.google.com/document/d/18Sw8XNElqvbFjaWrKtbZa5PI4mPBQp1Jg9CKVh53STw/edit?tab=t.0',
    tag: 'Document',
  },
  {
    name: 'Monthly CPR Report',
    description: 'Monthly Cost, Progress, and Risk report template for executive and leadership reporting.',
    url: 'https://docs.google.com/document/d/1R4_2GVyQ59MZYZuFTsEu2Um-UemMxzYUZu-oSqy1ExU/edit?tab=t.0',
    tag: 'Document',
  },
  {
    name: 'Change Management Log',
    description: 'Log and track scope or process changes with impact, owner, and approval status.',
    url: 'https://docs.google.com/spreadsheets/d/1US2kxRm4HXzXX8_cKkT92xGzYvxw8UxizEwBegHao1I/edit?gid=0#gid=0',
    tag: 'Spreadsheet',
  },
  {
    name: 'Issue Log',
    description: 'Track open issues, owners, priority, and resolution status across your programme.',
    url: 'https://docs.google.com/spreadsheets/d/1oWUJf7uk773N04ln-q4lwP2lEHOCVY8k0W7kruDTBKA/edit?gid=0#gid=0',
    tag: 'Spreadsheet',
  },
];

function ToolCard({ tool, cta }) {
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
          {cta}
        </div>
      </div>
    </a>
  );
}

export default function ResourcesPage() {
  useSEO({ title: 'TPM Toolkit', description: 'AI-powered tools and document templates built for Technical Program Managers.' });
  return (
    <PageLayout>
      <div className="eyebrow" style={{ marginBottom: 10 }}>TPM Toolkit</div>
      <h1 style={{ margin: '0 0 16px' }}>Tools built for TPMs.</h1>
      <p style={{ fontSize: 17, color: 'var(--ink-3)', maxWidth: 600, marginBottom: 48 }}>
        A collection of AI-powered tools and document templates to help you write better,
        communicate more clearly, and move faster.
      </p>

      <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
        AI Assistants
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 56 }}>
        {GPT_TOOLS.map(tool => (
          <ToolCard key={tool.name} tool={tool} cta="Open in ChatGPT →" />
        ))}
      </div>

      <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
        Document Templates
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 56 }}>
        {TEMPLATES.map(tool => (
          <ToolCard key={tool.name} tool={tool} cta="Open template →" />
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
    </PageLayout>
  );
}
