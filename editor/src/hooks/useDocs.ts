import { useState } from 'react';

const SERVER = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';

export function useDocs() {
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<{ jsdoc: string; readme: string } | null>(null);

  const generateDocs = async (code: string, componentName: string) => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${SERVER}/api/docs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, componentName }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDocs(data);
    } catch (err) {
      console.error('[useDocs]', err);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => setDocs(null);

  return { loading, docs, generateDocs, clear };
}
