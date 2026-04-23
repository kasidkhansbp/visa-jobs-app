import { useEffect } from 'react';

export default function useSEO({ title, description }) {
  useEffect(() => {
    if (title) {
      document.title = `${title} — TPMguild`;
      document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${title} — TPMguild`);
      document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', `${title} — TPMguild`);
    }
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description);
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
      document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
    }
  }, [title, description]);
}
