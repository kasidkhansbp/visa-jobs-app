import useSEO from '../hooks/useSEO';

function LinkPill({ href, label }) {
  return (
    <a
      href={href}
      target={href.startsWith('mailto') ? undefined : '_blank'}
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 16px',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-full)',
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--ink-2)',
        textDecoration: 'none',
        background: 'var(--paper)',
        transition: 'border-color 120ms ease, color 120ms ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--ink-2)'; }}
    >
      {label}
    </a>
  );
}

export default function AboutPage() {
  useSEO({ title: 'About', description: 'TPMguild was built by Md Kasid Khan, a Technical Program Manager at Amazon Prime Video in London, to help TPMs find visa-sponsored roles in the UK.' });
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 56px 96px' }}>

      <div className="eyebrow" style={{ marginBottom: 10 }}>CREATOR</div>
      <h1 style={{ margin: '0 0 8px', fontSize: 36 }}>Md Kasid Khan</h1>
      <p style={{ fontSize: 16, color: 'var(--ink-3)', margin: '0 0 24px' }}>
        Technical Program Manager at Amazon Prime Video, London.
        13 years in software development, now applying AI and its agentic capabilities to product and program delivery.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 48 }}>
        <LinkPill href="https://www.linkedin.com/in/kasid-khan-a8767572" label="LinkedIn" />
        <LinkPill href="https://github.com/kasidkhansbp" label="GitHub" />
        <LinkPill href="mailto:kasidkhan@tpmguild.com" label="kasidkhan@tpmguild.com" />
      </div>

      <div style={{
        padding: '24px 28px',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        background: 'var(--paper)',
        marginBottom: 40,
      }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
          Why TPMguild
        </h2>
        <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7, margin: 0 }}>
          Finding a TPM role that can sponsor a Skilled Worker visa in the UK is harder than it should be.
          Job boards surface hundreds of listings but give no signal on which employers are actually
          licensed sponsors. Candidates end up applying to roles they can never take.
        </p>
        <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7, margin: '12px 0 0' }}>
          TPMguild was built to fix that. Every listing is cross-referenced against the UK Home Office
          register before it appears. If it is here, the employer can sponsor.
        </p>
      </div>

      <div style={{
        padding: '24px 28px',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        background: 'var(--paper)',
      }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
          Background
        </h2>
        <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7, margin: 0 }}>
          I've spent 13+ years in software development and management working across India, United States, Spain, and United Kingdom, building products at the intersection of data, operations, and decision-making.
        </p>
        <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7, margin: '12px 0' }}>
          My work spans Amazon Retail and Amazon Business, where I led the development and launch of incentive and marketing platforms across Australia, India, and Mexico, bringing structure to complex programs and enabling teams to move faster.
        </p>
        <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7, margin: '12px 0' }}>
          Today, I'm building finance and planning systems at Prime Video in London.
        </p>
        <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7, margin: '12px 0 0', fontStyle: 'italic' }}>
          Across all of this, the focus has remained consistent: bringing clarity and structure to
          ambiguity through simple, repeatable systems.
        </p>
      </div>

    </div>
  );
}
