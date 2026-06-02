import useSEO from '../hooks/useSEO';
import PageLayout from '../components/PageLayout';

export default function AboutPage() {
  useSEO({ title: 'About', description: 'TPMguild — a focused job board for Technical Program Managers seeking Skilled Worker visa sponsorship in the UK.' });
  return (
    <PageLayout>
      <div className="eyebrow" style={{ marginBottom: 10 }}>ABOUT</div>
      <h1 style={{ margin: '0 0 8px', fontSize: 36 }}>TPMguild</h1>
      <p style={{ fontSize: 16, color: 'var(--ink-3)', margin: '0 0 24px' }}>
        A focused job board for Technical Program Managers seeking Skilled Worker visa sponsorship in the UK.
        Every listing is cross-referenced daily against the UK Home Office licensed sponsor register.
      </p>
    </PageLayout>
  );
}
