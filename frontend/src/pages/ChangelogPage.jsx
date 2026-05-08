import useSEO from '../hooks/useSEO';
import PageLayout from '../components/PageLayout';

const ENTRIES = [
  {
    date: '08 May 2026',
    items: [
      {
        title: 'Sponsor register — animated charts',
        tag: 'IMPROVED',
        description: 'Hovering a segment on the visa routes donut chart enlarges it, shows the route name and percentage in the centre, and dims all other segments. Page header and stat cards now animate in on load with count-up numbers.',
      },
      {
        title: 'Admin — user login tracking',
        tag: 'IMPROVED',
        description: 'Admin page now shows login count and last login date per user, sorted by most active users first.',
      },
      {
        title: 'Mobile nav — hamburger menu',
        tag: 'IMPROVED',
        description: 'On mobile, the navigation collapses into a hamburger menu that opens a full-screen drawer with all links.',
      },
    ],
  },
  {
    date: '07 May 2026',
    items: [
      {
        title: 'Market Insights — animated heatmap',
        tag: 'IMPROVED',
        description: 'Numbers count up on page load, sparklines draw left to right with animated dots, and a pulsing live dot marks the latest data point. Rows stagger in sequentially.',
      },
      {
        title: 'Globe on hero',
        tag: 'NEW',
        description: 'A rotating wireframe globe with a pulsing London pin now sits beside the hero headline.',
      },
      {
        title: 'Admin — hide job listings',
        tag: 'NEW',
        description: 'Admin can now hide individual job listings from the jobs page without deleting them from the database. A "Show hidden" toggle reveals hidden jobs with an Unhide option.',
      },
    ],
  },
  {
    date: '06 May 2026',
    items: [
      {
        title: 'Job Tracker — open to all users',
        tag: 'IMPROVED',
        description: 'Gmail connection is now available to all logged-in users. Previously restricted to an allowlist.',
      },
    ],
  },
  {
    date: '05 May 2026',
    items: [
      {
        title: 'Market Insights',
        tag: 'NEW',
        description: 'Weekly London TPM job market report — sector heatmap with openings, week-on-week change, trajectory sparklines and demand bars. Requires sign-in.',
      },
      {
        title: 'Sector classification',
        tag: 'NEW',
        description: 'Jobs are now classified into sectors (Infrastructure, Cybersecurity, AI/ML, Fintech, Data platforms, DevOps, E-commerce, Product, Software Delivery) using keyword matching on title and description.',
      },
    ],
  },
  {
    date: '04 May 2026',
    items: [
      {
        title: 'Job Tracker — manual applications',
        tag: 'IMPROVED',
        description: 'Users can now add job applications manually and update the status of any application (Applied, Interview, Rejected, Offer, Withdrawn, No Response) via a dropdown on each card.',
      },
    ],
  },
  {
    date: '03 May 2026',
    items: [
      {
        title: 'Google sign-in as popup',
        tag: 'IMPROVED',
        description: 'Signing in with Google now opens a popup window instead of redirecting the page. After approving, the popup closes automatically and the page updates — no full page reload or navigation away.',
      },
      {
        title: 'Email tracker — broader detection',
        tag: 'IMPROVED',
        description: 'Added more email subject patterns to the job application detector: "received your application", "confirm your interview", "recruiter prescreen", and "recruiter". More application emails are now picked up automatically.',
      },
    ],
  },
  {
    date: '02 May 2026',
    items: [
      {
        title: 'Career Stories',
        tag: 'NEW',
        description: 'Write and sharpen your TPM career stories for interviews. Capture the raw narrative, then answer 8 structured prompts covering what was broken, urgency, ownership, technical/organisational/decision challenges, hardest moment, and real impact. Multiple stories supported — one per program or initiative.',
      },
      {
        title: 'Auto DB migrations on deploy',
        tag: 'IMPROVED',
        description: 'Database migrations now run automatically on every gateway deployment. New tables and schema changes are applied to production without manual intervention.',
      },
    ],
  },
  {
    date: '28 Apr 2026',
    items: [
      {
        title: 'Job Tracker',
        tag: 'NEW',
        description: 'Connect your Gmail and the agent automatically tracks your job applications. Detects application confirmations, interview invites, and rejections. Applications organised by status tabs — Applied, Interview, Rejected, Offer — sorted by most recent.',
      },
      {
        title: 'AI Email Agent',
        tag: 'NEW',
        description: 'LangGraph-powered agent monitors your Gmail inbox hourly. Uses Claude to classify job-related emails and update application statuses automatically. No manual input required.',
      },
      {
        title: 'Terms of Service',
        tag: 'NEW',
        description: 'Added Terms of Service page covering acceptable use, Gmail integration, intellectual property, and governing law.',
      },
      {
        title: 'Privacy policy',
        tag: 'IMPROVED',
        description: 'Updated to include Gmail data usage — read-only access, what is extracted, what is never stored, and how to revoke access.',
      },
      {
        title: 'Consistent page layout',
        tag: 'IMPROVED',
        description: 'All content pages now share a common layout component — consistent width and spacing across About, Changelog, Coverage, Privacy, Resources, and more.',
      },
    ],
  },
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
    <PageLayout>
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
    </PageLayout>
  );
}
