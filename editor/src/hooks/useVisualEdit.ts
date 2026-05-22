import { useState } from 'react';

const SERVER = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';

export function useVisualEdit() {
  const [loading, setLoading] = useState(false);

  const apply = async (code: string, outerHTML: string, instruction: string): Promise<string | null> => {
    if (!code.trim() || !outerHTML.trim() || !instruction.trim()) return null;
    setLoading(true);
    try {
      const fullInstruction = `In the component code, find the element matching this HTML: ${outerHTML}. Then: ${instruction}. Return the full updated component code.`;
      const res = await fetch(`${SERVER}/api/inline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedCode: code, instruction: fullInstruction }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { replacement } = await res.json();
      return replacement ?? null;
    } catch (err) {
      console.error('[useVisualEdit]', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, apply };
}
