import { useState } from 'react';

const EMAIL = 'kasidkhan@tpmguild.com';

export default function ContactPage() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '64px 56px' }}>
      <div className="eyebrow" style={{ marginBottom: 10 }}>Contact</div>
      <h1 style={{ margin: '0 0 16px' }}>Get in touch.</h1>
      <p style={{ fontSize: 17, color: 'var(--ink-3)', marginBottom: 48 }}>
        Have a question, suggestion, or found a bug? Send us an email and we will get back to you.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <a
          href={`mailto:${EMAIL}`}
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--accent)',
            textDecoration: 'none',
            borderBottom: '1px solid var(--accent)',
            paddingBottom: 2,
          }}
        >
          {EMAIL}
        </a>
        <button
          onClick={handleCopy}
          style={{
            fontSize: 12,
            padding: '4px 10px',
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--radius)',
            background: 'var(--paper)',
            color: copied ? 'var(--verified)' : 'var(--ink-3)',
            cursor: 'pointer',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
