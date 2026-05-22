import { useState, useCallback } from 'react';

const SERVER = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';

export function useReview() {
  const [streaming, setStreaming] = useState(false);
  const [result, setResult] = useState('');

  const review = useCallback(async (code: string) => {
    if (!code.trim()) return;
    setStreaming(true);
    setResult('');
    try {
      const res = await fetch(`${SERVER}/api/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const { type, content } = JSON.parse(line.slice(6));
            if (type === 'delta') setResult(r => r + content);
            if (type === 'done' || type === 'error') break;
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (err) {
      console.error('[useReview]', err);
      setResult('Error fetching review.');
    } finally {
      setStreaming(false);
    }
  }, []);

  const clear = useCallback(() => setResult(''), []);

  return { streaming, result, review, clear };
}
