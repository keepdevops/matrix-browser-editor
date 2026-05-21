import { useState, useCallback } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useSessionStore } from '../store/sessionStore';

interface ShareState {
  loading: boolean;
  shareId: string | null;
  error: string | null;
}

export function useShare() {
  const [state, setState] = useState<ShareState>({ loading: false, shareId: null, error: null });
  const { code, language, componentName } = useEditorStore();
  const { styleSystem } = useSessionStore();

  const share = useCallback(async () => {
    if (!code.trim()) return;
    setState({ loading: true, shareId: null, error: null });
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, componentName, styleSystem }),
      });
      if (!res.ok) throw new Error(`Share failed: ${res.status}`);
      const data = await res.json();
      setState({ loading: false, shareId: data.id, error: null });
      const fullUrl = `${window.location.origin}${window.location.pathname}?share=${data.id}`;
      await navigator.clipboard.writeText(fullUrl).catch(() => {});
      return fullUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Share failed';
      console.error('[useShare]', msg);
      setState({ loading: false, shareId: null, error: msg });
    }
  }, [code, language, componentName, styleSystem]);

  const dismiss = useCallback(() => setState({ loading: false, shareId: null, error: null }), []);

  return { ...state, share, dismiss };
}
