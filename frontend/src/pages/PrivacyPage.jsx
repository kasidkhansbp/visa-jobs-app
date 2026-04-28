const SECTIONS = [
  {
    title: 'What we collect',
    body: 'Browsing job listings is anonymous and no personal data is collected. If you contact us by email, we receive your email address and the content of your message. If you sign in via Google, we collect your name, email address, and profile picture as provided by Google. If you connect Gmail, we access your inbox read-only to detect job application emails — see the Gmail data section below.',
  },
  {
    title: 'Cookies',
    body: 'We use Google Analytics cookies (_ga, _gid) to collect anonymous usage data such as pages visited, time on site, and approximate location. We do not use advertising cookies. If you are signed in, a session cookie is set to keep you authenticated.',
  },
  {
    title: 'Analytics',
    body: 'We use Google Analytics 4 to understand how visitors use TPMguild. This includes which pages are visited, what searches are performed, and which features are used. This data is anonymous and aggregated. It is processed by Google on servers in the United States.',
  },
  {
    title: 'Account data',
    body: 'When sign-in is introduced, creating an account via Google OAuth will allow us to store your saved searches and preferences. We will store your name and email address. We will not sell or share your personal data with third parties. You may request deletion of your account and associated data at any time by contacting kasidkhan@tpmguild.com.',
  },
  {
    title: 'Gmail data',
    body: 'If you choose to connect your Gmail account, TPMguild requests read-only access (gmail.readonly) to your inbox. We use this access solely to detect job application-related emails (such as application confirmations, interview invites, and rejections) and to update your job application tracker automatically. We do not read, store, or process any emails unrelated to job applications. Email content is never stored — only the extracted structured data (company name, role, and application status) is saved. We do not share your Gmail data with any third parties. You can revoke Gmail access at any time from the Job Tracker page.',
  },
  {
    title: 'Third-party data sources',
    body: 'Job listings are fetched from the Adzuna and Reed APIs. Sponsor data is sourced from the UK Home Office public register. We do not share any data with these providers about your usage of this site.',
  },
  {
    title: 'Data storage',
    body: 'Job listings and any account data are stored in a private database hosted on Railway (EU region). Data is not shared with third parties beyond what is described in this policy.',
  },
  {
    title: 'Data retention',
    body: 'Job listings are retained for 90 days. Account data is retained for as long as your account is active. If you request account deletion, your personal data will be removed within 30 days.',
  },
  {
    title: 'Your rights',
    body: 'Under UK GDPR you have the right to access, correct, or delete any personal data we hold about you. You also have the right to object to processing and to data portability. To exercise any of these rights, contact us at kasidkhan@tpmguild.com.',
  },
  {
    title: 'Changes to this policy',
    body: 'We update this policy in advance of any changes to our data practices, so you always know what to expect before it takes effect. The date at the top of this page reflects when it was last updated.',
  },
];

import useSEO from '../hooks/useSEO';
import PageLayout from '../components/PageLayout';

export default function PrivacyPage() {
  useSEO({ title: 'Privacy Policy', description: 'TPMguild privacy policy. How we collect, use, and protect your data.' });
  return (
    <PageLayout>
      <div className="eyebrow" style={{ marginBottom: 10 }}>Privacy</div>
      <h1 style={{ margin: '0 0 12px' }}>Privacy policy.</h1>
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
