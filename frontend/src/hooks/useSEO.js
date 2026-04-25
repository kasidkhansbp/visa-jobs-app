import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE = 'https://www.tpmguild.com';

export default function useSEO({ title, description }) {
  const { pathname } = useLocation();
  const fullUrl = `${SITE}${pathname}`;

  useEffect(() => {
    const fullTitle = title ? `${title} — TPMguild` : 'TPMguild — Sponsor-verified TPM jobs in the UK';
    const desc = description ?? '';

    document.title = fullTitle;

    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', fullUrl);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);

    setCanonical(fullUrl);
  }, [title, description, fullUrl]);
}

function setMeta(attr, key, value) {
  const el = document.querySelector(`meta[${attr}="${key}"]`);
  if (el) el.setAttribute('content', value);
}

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}
