import { useState } from 'react';

export function useGist() {
  const [loading, setLoading] = useState(false);
  const [gistUrl, setGistUrl] = useState<string | null>(null);

  const createGist = async (componentName: string, code: string, language: string) => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const filename = `${componentName || 'Component'}.${language}`;
      const res = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/vnd.github+json' },
        body: JSON.stringify({
          description: `${componentName} — exported from Matrix Editor`,
          public: true,
          files: { [filename]: { content: code } },
        }),
      });
      if (!res.ok) { console.error('[useGist] GitHub API error:', res.status); return; }
      const data = await res.json();
      setGistUrl(data.html_url);
      window.open(data.html_url, '_blank', 'noopener');
    } catch (err) {
      console.error('[useGist] failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, gistUrl, createGist };
}
