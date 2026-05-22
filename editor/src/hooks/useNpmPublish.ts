import { useState } from 'react';

const SERVER = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';

export interface PublishOptions {
  name: string;
  version: string;
  description: string;
  code: string;
  language: string;
}

export function useNpmPublish() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string; name: string; version: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const publish = async (opts: PublishOptions) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${SERVER}/api/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Publish failed';
      console.error('[useNpmPublish]', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => { setResult(null); setError(null); };

  return { loading, result, error, publish, clear };
}
