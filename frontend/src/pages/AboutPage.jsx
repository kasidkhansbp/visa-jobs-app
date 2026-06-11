import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import PageLayout from '../components/PageLayout';

const STEPS = [
  {
    number: '01',
    title: 'Build your CV Box',
    body: 'Upload multiple CV versions tailored to different roles and industries. Each version gets its own shareable link — send a recruiter exactly the CV you want them to see, not a generic one.',
    link: { to: '/cv', label: 'Go to CV Box' },
  },
  {
    number: '02',
    title: 'Write your stories',
    body: 'Recruiters ask the same questions in every interview. Write your STAR stories now — before the call, not during it. Cover the situations that show ownership, cross-functional delivery, and handling ambiguity.',
    link: { to: '/stories', label: 'Go to Stories' },
  },
  {
    number: '03',
    title: 'Prepare your answers',
    body: 'Go through the question bank and write your answers in advance. General TPM questions, behavioural prompts, and leadership scenarios — the ones every recruiter reaches for. Preparation is the gap between a good candidate and a hired one.',
    link: { to: '/resources', label: 'Go to Resources' },
  },
  {
    number: '04',
    title: 'Apply to jobs',
    body: 'Browse verified TPM roles — every listing is cross-referenced against the UK Home Office sponsor register, so you know before you apply whether the employer can sponsor a Skilled Worker visa.',
    link: { to: '/jobs', label: 'Browse jobs' },
  },
];

export default function AboutPage() {
  useSEO({ title: 'About', description: 'How to use TPMguild — build your CV, write your stories, prepare your answers, and apply to visa-sponsored TPM roles in the UK.' });
  return (
    <PageLayout>

      <div className="eyebrow" style={{ marginBottom: 10, color: 'var(--accent)' }}>HOW TO USE TPMGUILD</div>
      <h1 style={{ margin: '0 0 16px', fontSize: 36 }}>Your job search, step by step.</h1>
      <p style={{ fontSize: 16, color: 'var(--ink-3)', maxWidth: 580, margin: '0 0 56px', lineHeight: 1.7 }}>
        TPMguild is a job board, a CV tool, a story editor, and an interview prep resource — built for UK TPM roles that will sponsor your visa. Here is how to use all of it.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {STEPS.map((step, i) => (
          <div
            key={step.number}
            style={{
              display: 'grid',
              gridTemplateColumns: '56px 1fr',
              gap: '0 24px',
              paddingBottom: i < STEPS.length - 1 ? 40 : 0,
              marginBottom: i < STEPS.length - 1 ? 40 : 0,
              borderBottom: i < STEPS.length - 1 ? '1px solid var(--line)' : 'none',
            }}
          >
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
              <h3 style={{ margin: '0 0 10px', fontSize: 20 }}>{step.title}</h3>
              <p style={{ margin: '0 0 16px', fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7 }}>{step.body}</p>
              <Link
                to={step.link.to}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--accent)',
                  textDecoration: 'none',
                }}
              >
                {step.link.label} →
              </Link>
            </div>
          </div>
        ))}
      </div>

    </PageLayout>
  );
}
