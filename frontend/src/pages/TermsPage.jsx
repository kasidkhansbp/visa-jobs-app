import useSEO from '../hooks/useSEO';
import PageLayout from '../components/PageLayout';

const SECTIONS = [
  {
    title: 'Acceptance of terms',
    body: 'By accessing or using TPMguild ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.',
  },
  {
    title: 'Description of service',
    body: 'TPMguild is a job board focused on Technical Program Manager roles in the UK that are eligible for Skilled Worker visa sponsorship. The Service also provides tools to help users manage CVs, track job applications, and access TPM-specific resources.',
  },
  {
    title: 'Eligibility',
    body: 'You must be at least 16 years old to use this Service. By using TPMguild you confirm that you meet this requirement.',
  },
  {
    title: 'User accounts',
    body: 'You may sign in using your Google account. You are responsible for maintaining the confidentiality of your account and for all activity that occurs under it. You agree to notify us immediately of any unauthorised use of your account at kasidkhan@tpmguild.com.',
  },
  {
    title: 'Gmail integration',
    body: 'If you choose to connect your Gmail account, you grant TPMguild read-only access to your inbox solely for the purpose of detecting job application-related emails. You may revoke this access at any time from the Job Tracker page. We do not send, delete, or modify any emails on your behalf.',
  },
  {
    title: 'Acceptable use',
    body: 'You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to gain unauthorised access to any part of the Service; (c) scrape, copy, or redistribute content from the Service without permission; (d) use automated tools to access the Service in a way that places unreasonable load on our infrastructure.',
  },
  {
    title: 'Intellectual property',
    body: 'All content, design, and code on TPMguild is owned by Md Kasid Khan and protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without prior written permission.',
  },
  {
    title: 'Third-party content',
    body: 'Job listings are sourced from third-party APIs (Adzuna, Reed) and the UK Home Office sponsor register. TPMguild does not guarantee the accuracy, completeness, or availability of any job listing. Sponsor verification indicates a valid licence at the time of the last data refresh — it does not guarantee active sponsorship for any specific role.',
  },
  {
    title: 'CV and application data',
    body: 'CVs you upload are stored securely and are only accessible to you. Shareable links you create are your responsibility — revoke them at any time from the CV Box page. Application tracking data derived from your Gmail is stored on your behalf and is not shared with third parties.',
  },
  {
    title: 'Disclaimer of warranties',
    body: 'TPMguild is provided "as is" without warranties of any kind, express or implied. We do not warrant that the Service will be uninterrupted, error-free, or that job listings are accurate or complete. Use of the Service is at your own risk.',
  },
  {
    title: 'Limitation of liability',
    body: 'To the fullest extent permitted by law, TPMguild and its owner shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service, including but not limited to loss of data, missed job opportunities, or reliance on inaccurate sponsor information.',
  },
  {
    title: 'Termination',
    body: 'We reserve the right to suspend or terminate your access to the Service at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.',
  },
  {
    title: 'Governing law',
    body: 'These Terms are governed by the laws of England and Wales. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.',
  },
  {
    title: 'Changes to these terms',
    body: 'We may update these Terms from time to time. We will notify users of significant changes by updating the date at the top of this page. Continued use of the Service after changes constitutes acceptance of the updated Terms.',
  },
  {
    title: 'Contact',
    body: 'If you have any questions about these Terms, please contact us at kasidkhan@tpmguild.com.',
  },
];

export default function TermsPage() {
  useSEO({ title: 'Terms of Service', description: 'TPMguild terms of service — your rights and responsibilities when using the platform.' });
  return (
    <PageLayout>
      <div className="eyebrow" style={{ marginBottom: 10 }}>Legal</div>
      <h1 style={{ margin: '0 0 12px' }}>Terms of Service.</h1>
      <p style={{ fontSize: 14, color: 'var(--ink-4)', marginBottom: 48 }}>Last updated: 28 April 2026</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        {SECTIONS.map(section => (
          <div key={section.title}>
            <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>{section.title}</h3>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.7 }}>{section.body}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 56, paddingTop: 24, borderTop: '1px solid var(--line)', fontSize: 13, color: 'var(--ink-4)' }}>
        Questions? Email <a href="mailto:kasidkhan@tpmguild.com" style={{ color: 'var(--accent)' }}>kasidkhan@tpmguild.com</a>
      </div>
    </PageLayout>
  );
}
