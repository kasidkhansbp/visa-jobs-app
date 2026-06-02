import useSEO from '../hooks/useSEO';
import PageLayout from '../components/PageLayout';

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

export default function CreatorPage() {
  useSEO({ title: 'Creator', description: 'TPMguild was built by Md Kasid Khan, a Technical Program Manager at Amazon Prime Video in London, to help TPMs find visa-sponsored roles in the UK.' });
  return (
    <PageLayout>

      <div className="eyebrow" style={{ marginBottom: 10 }}>CREATOR</div>
      <h1 style={{ margin: '0 0 8px', fontSize: 36 }}>Md Kasid Khan</h1>
      <p style={{ fontSize: 16, color: 'var(--ink-3)', margin: '0 0 6px' }}>
        Hi, I'm Kasid 👋
      </p>
      <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7, margin: '0 0 24px' }}>
        I build utility tools for developers working with LLMs and AI agents.
        My work is practical: real problems, focused solutions, and tools you can actually use in your stack today.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 48 }}>
        <a
          href="https://www.linkedin.com/in/kasid-khan-a8767572"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 'var(--radius-full)',
            border: '1px solid var(--line)', background: 'var(--paper)',
            textDecoration: 'none', fontSize: 13, fontWeight: 500, color: 'var(--ink-2)',
            transition: 'border-color 120ms ease, color 120ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#0A66C2'; e.currentTarget.style.color = '#0A66C2'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--ink-2)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          LinkedIn
        </a>
        <a
          href="https://github.com/kasidkhansbp"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 'var(--radius-full)',
            border: '1px solid var(--line)', background: 'var(--paper)',
            textDecoration: 'none', fontSize: 13, fontWeight: 500, color: 'var(--ink-2)',
            transition: 'border-color 120ms ease, color 120ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink-1)'; e.currentTarget.style.color = 'var(--ink-1)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--ink-2)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
          GitHub
        </a>
        <a
          href="mailto:kasidkhan@tpmguild.com"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 'var(--radius-full)',
            border: '1px solid var(--line)', background: 'var(--paper)',
            textDecoration: 'none', fontSize: 13, fontWeight: 500, color: 'var(--ink-2)',
            transition: 'border-color 120ms ease, color 120ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--ink-2)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          kasidkhan@tpmguild.com
        </a>
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
        <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7, margin: '12px 0 16px' }}>
          TPMguild was built to fix that. Every listing is cross-referenced against the UK Home Office
          register before it appears. If it is here, the employer can sponsor.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
          <a
            href="https://www.linkedin.com/company/tpmguild/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderRadius: 'var(--radius-full)',
              border: '1px solid var(--line)', background: 'var(--paper)',
              textDecoration: 'none', fontSize: 13, fontWeight: 500, color: 'var(--ink-2)',
              transition: 'border-color 120ms ease, color 120ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0A66C2'; e.currentTarget.style.color = '#0A66C2'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--ink-2)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </a>
          <a
            href="https://www.instagram.com/tpmguild/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderRadius: 'var(--radius-full)',
              border: '1px solid var(--line)', background: 'var(--paper)',
              textDecoration: 'none', fontSize: 13, fontWeight: 500, color: 'var(--ink-2)',
              transition: 'border-color 120ms ease, color 120ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#E1306C'; e.currentTarget.style.color = '#E1306C'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--ink-2)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Instagram
          </a>
          <a
            href="https://www.reddit.com/r/TPMGuild/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderRadius: 'var(--radius-full)',
              border: '1px solid var(--line)', background: 'var(--paper)',
              textDecoration: 'none', fontSize: 13, fontWeight: 500, color: 'var(--ink-2)',
              transition: 'border-color 120ms ease, color 120ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF4500'; e.currentTarget.style.color = '#FF4500'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--ink-2)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
            </svg>
            Reddit
          </a>
        </div>
      </div>

      <div style={{
        padding: '24px 28px',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        background: 'var(--paper)',
        marginBottom: 16,
      }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
          Projects
        </h2>
        <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7, margin: '0 0 12px' }}>
          I'm building <a href="https://github.com/kasidkhansbp/llm-inspect" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontWeight: 600, textDecoration: 'underline', textDecorationColor: 'var(--line)' }}><strong>llm-inspect</strong></a> — a devtools-style debugger for LLM API calls. Inspect requests, responses, token usage, cost, and tool calls in real time. Built for developers who are tired of flying blind when debugging AI agents.
        </p>
        <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7, margin: 0 }}>
          I also run <a href="https://github.com/kasidkhansbp/visa-jobs-app" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontWeight: 600, textDecoration: 'underline', textDecorationColor: 'var(--line)' }}><strong>TPMGuild</strong></a> — a job board for Technical Program Managers in the UK that only shows roles at verified visa-sponsoring companies. No more applying and finding out too late.
        </p>
      </div>

      <div style={{
        padding: '24px 28px',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        background: 'var(--paper)',
        marginBottom: 16,
      }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
          What I work on
        </h2>
        <ul style={{ margin: 0, padding: '0 0 0 18px', listStyle: 'disc' }}>
          <li style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7, marginBottom: 6 }}>
            <strong>LLM observability</strong> — inspect, debug, and understand what your agent is actually doing.
          </li>
          <li style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7, marginBottom: 6 }}>
            <strong>Developer utilities</strong> — tools that slot into your existing workflow without friction.
          </li>
          <li style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7 }}>
            <strong>Visa-verified job search</strong> — helping TPMs in the UK cut through the noise.
          </li>
        </ul>
      </div>

      <div style={{
        padding: '24px 28px',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        background: 'var(--paper)',
      }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
          About Me
        </h2>
        <ul style={{ margin: 0, padding: '0 0 0 18px', listStyle: 'disc' }}>
          <li style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7, marginBottom: 6 }}>
            TPM with 13+ years in software development — building data platforms, shipping at scale.
          </li>
          <li style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7, marginBottom: 6 }}>
            Building in public at the intersection of AI tooling and developer experience.
          </li>
          <li style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.7 }}>
            Based in London 🇬🇧
          </li>
        </ul>
      </div>

    </PageLayout>
  );
}
