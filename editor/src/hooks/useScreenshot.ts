import { useState, useCallback } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useSessionStore } from '../store/sessionStore';

interface ScreenshotState {
  imageUrl: string | null;
  isCapturing: boolean;
  error: string | null;
}

export function useScreenshot() {
  const [state, setState] = useState<ScreenshotState>({ imageUrl: null, isCapturing: false, error: null });
  const { code } = useEditorStore();
  const { styleSystem, theme } = useSessionStore();

  const capture = useCallback(async () => {
    setState({ imageUrl: null, isCapturing: true, error: null });
    try {
      const res = await fetch('http://localhost:3001/api/preview/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, styleSystem, theme, width: 800, height: 600 }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Screenshot failed');
      setState({ imageUrl: data.image, isCapturing: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[useScreenshot] capture error:', message);
      setState({ imageUrl: null, isCapturing: false, error: message });
    }
  }, [code, styleSystem, theme]);

  const dismiss = useCallback(() => {
    setState({ imageUrl: null, isCapturing: false, error: null });
  }, []);

  return { ...state, capture, dismiss };
}
