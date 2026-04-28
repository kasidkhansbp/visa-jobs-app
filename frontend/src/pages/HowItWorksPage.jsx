import useSEO from '../hooks/useSEO';
import PageLayout from '../components/PageLayout';

export default function HowItWorksPage() {
  useSEO({ title: 'How it works', description: 'TPMguild fetches TPM jobs daily from Adzuna and Reed, then cross-references every employer against the UK Home Office Skilled Worker sponsor register.' });
  const steps = [
    {
      number: '01',
      title: 'We fetch TPM jobs daily',
      body: 'Every day we pull Technical Program Manager listings from Adzuna and Reed - two of the UK\'s largest job boards. We search multiple keyword variations to maximise coverage.',
    },
    {
      number: '02',
      title: 'We cross-reference the sponsor register',
      body: 'Every employer is checked against the UK Home Office register of licensed Skilled Worker sponsors - a public dataset of 140,000+ organisations authorised to sponsor overseas workers.',
    },
    {
      number: '03',
      title: 'Jobs get labelled',
      body: 'If the employer appears on the register, the job is marked Sponsor-verified. If they sponsor three or more visa routes, they\'re also marked as an Active sponsor - a signal of a well-established sponsorship programme.',
    },
    {
      number: '04',
      title: 'You search with confidence',
      body: 'Filter by sponsor status, salary, source, and employment type. Every result you see has been checked. No more manually googling "does [company] sponsor visas?"',
    },
  ];

  return (
    <PageLayout>
      <div className="eyebrow" style={{ marginBottom: 10 }}>How it works</div>
      <h1 style={{ margin: '0 0 16px' }}>From job board to visa confidence.</h1>
      <p style={{ fontSize: 17, color: 'var(--ink-3)', maxWidth: 600, marginBottom: 56 }}>
        TPMguild does one thing well - it tells you which TPM roles in the UK can actually sponsor your visa.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {steps.map(step => (
          <div key={step.number} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 24 }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              color: 'var(--accent)',
              fontWeight: 700,
              paddingTop: 4,
            }}>
              {step.number}
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>{step.title}</h3>
              <p style={{ margin: 0, fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.65 }}>{step.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 64,
        padding: '24px 28px',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        background: 'var(--paper)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 8 }}>A note on accuracy</div>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.65 }}>
          The sponsor register is updated monthly by the Home Office. A match means the employer
          is currently licensed - it does not guarantee they are actively hiring on a sponsored basis
          for every role. Always confirm sponsorship availability directly with the employer.
        </p>
      </div>
    </PageLayout>
  );
}
