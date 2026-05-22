import { useState } from 'react';

const SERVER = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';

interface PendingVisualEdit {
  oldCode: string;
  newCode: string;
}

export function useVisualEdit() {
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<PendingVisualEdit | null>(null);

  const apply = async (code: string, outerHTML: string, instruction: string): Promise<void> => {
    if (!code.trim() || !outerHTML.trim() || !instruction.trim()) return;
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
      if (replacement) setPending({ oldCode: code, newCode: replacement });
    } catch (err) {
      console.error('[useVisualEdit]', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmPending = (onConfirm: (newCode: string) => void) => {
    if (pending) { onConfirm(pending.newCode); setPending(null); }
  };

  const rejectPending = () => setPending(null);

  return { loading, apply, pending, confirmPending, rejectPending };
}
