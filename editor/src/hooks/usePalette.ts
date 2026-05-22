import { useState } from 'react';
import type { TokenValues } from '../store/tokenStore';

const SERVER = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';

export function usePalette() {
  const [loading, setLoading] = useState(false);

  const generate = async (description: string): Promise<Partial<TokenValues> | null> => {
    if (!description.trim()) return null;
    setLoading(true);
    try {
      const res = await fetch(`${SERVER}/api/palette`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { colors } = await res.json();
      return colors as Partial<TokenValues>;
    } catch (err) {
      console.error('[usePalette]', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, generate };
}
