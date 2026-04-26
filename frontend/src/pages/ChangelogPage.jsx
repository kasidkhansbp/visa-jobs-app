import useSEO from '../hooks/useSEO';

const ENTRIES = [
  {
    date: '26 Apr 2026',
    items: [
      {
        title: 'Shareable CV links',
        tag: 'NEW',
        description: 'Generate a shareable link for any CV version. Links never expire — revoke them at any time. View count and last opened date tracked per link.',
      },
      {
        title: 'Sponsor verification — automated',
        tag: 'IMPROVED',
        description: 'Sponsor verification now runs automatically. Daily cron matches new jobs against the 140K sponsor register. Monthly full rematch when the Home Office register is refreshed.',
      },
      {
        title: 'SEO & analytics',
        tag: 'IMPROVED',
        description: 'GA4 page_view events now fire on every route change — not just the initial page load. Canonical and og:url tags updated per page.',
      },
      {
        title: 'Admin stats',
        tag: 'NEW',
        description: 'Internal admin page showing total users, new signups, job counts by source, sponsor verification stats, and CV Box usage.',
      },
    ],
  },
  {
    date: '25 Apr 2026',
    items: [
      {
        title: 'CV Box',
        tag: 'NEW',
        description: 'Upload multiple CV versions tailored to different roles and industries. Drag and drop PDFs, rename versions inline, download or delete at any time. Sponsors and Resources pages now require sign-in.',
      },
    ],
  },
  {
    date: '24 Apr 2026',
    items: [
      {
        title: 'Google sign-in',
        tag: 'NEW',
        description: 'Sign in with your Google account to access protected features. JWT stored securely in httpOnly cookies with cross-domain support via api.tpmguild.com.',
      },
      {
        title: 'Document templates',
        tag: 'NEW',
        description: 'Added 7 TPM document templates to the Resources page — RAID log, weekly report, program plan, alignment doc, CPR report, change management log, and issue log.',
      },
    ],
  },
  {
    date: '23 Apr 2026',
    items: [
      {
        title: 'About page',
        tag: 'NEW',
        description: 'Added creator profile, background, and links to TPMguild LinkedIn, Instagram, and Reddit.',
      },
      {
        title: 'Resources page',
        tag: 'NEW',
        description: 'Curated AI assistants and document templates built specifically for TPMs.',
      },
      {
        title: 'SEO improvements',
        tag: 'IMPROVED',
        description: 'Added meta tags, Open Graph tags, sitemap.xml, and robots.txt to improve Google search indexing.',
      },
      {
        title: 'Job filters',
        tag: 'IMPROVED',
        description: 'Added employment type, contract type, and active sponsor filters. Load more pagination added to the job list.',
      },
    ],
  },
  {
    date: '21 Apr 2026',
    items: [
      {
        title: 'Sponsor register explorer',
        tag: 'NEW',
        description: 'Browse all 40,000+ UK employers licensed to sponsor Skilled Worker visas. Filter by city and route type, with verification status shown on every job.',
      },
    ],
  },
  {
    date: '20 Apr 2026',
    items: [
      {
        title: 'Job search',
        tag: 'NEW',
        description: 'Live TPM job listings pulled from Adzuna and Reed, filtered to visa-sponsoring employers. Deployed to Railway with PostgreSQL and a daily refresh scheduler.',
      },
    ],
  },
  {
    date: '17 Apr 2026',
    items: [
      {
        title: 'Third-party API clients',
        tag: 'NEW',
        description: 'Built clients for Adzuna and Reed APIs with a daily cron scheduler to keep job listings fresh.',
      },
    ],
  },
  {
    date: '10 Apr 2026',
    items: [
      {
        title: 'Project started',
        tag: 'NEW',
        description: 'Initial project structure created. TPMguild — a focused job board for Technical Program Managers seeking visa-sponsored roles in the UK.',
      },
    ],
  },
];

const TAG_STYLE = {
  NEW:      { background: 'var(--verified-wash)', color: 'var(--verified)' },
  IMPROVED: { background: 'var(--accent-wash)',   color: 'var(--accent)'   },
};

export default function ChangelogPage() {
  useSEO({ title: 'Changelog', description: 'What has shipped on TPMguild and when.' });

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '64px var(--s-9) 96px' }}>
      <div className="eyebrow" style={{ marginBottom: 10 }}>CHANGELOG</div>
      <h1 style={{ margin: '0 0 8px' }}>What's new.</h1>
      <p style={{ fontSize: 15, color: 'var(--ink-3)', marginBottom: 56 }}>
        A running log of features and improvements shipped to TPMguild.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {ENTRIES.map(group => (
          <div key={group.date}>
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--ink-4)',
              fontFamily: 'var(--font-mono)',
              paddingBottom: 14,
              borderBottom: '1px solid var(--line)',
              marginBottom: 20,
            }}>
              {group.date}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {group.items.map(item => (
                <div key={item.title} style={{ display: 'flex', gap: 14, alignItems: 'start' }}>
                  <span style={{
                    ...TAG_STYLE[item.tag],
                    fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.06em',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    whiteSpace: 'nowrap',
                    marginTop: 3,
                    flexShrink: 0,
                  }}>
                    {item.tag}
                  </span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.65 }}>
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
