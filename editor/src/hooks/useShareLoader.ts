import { useEffect, useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useSessionStore } from '../store/sessionStore';

export function useShareLoader() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const { setCode, setLanguage } = useEditorStore();
  const { setStyleSystem } = useSessionStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('share');
    if (!id) return;

    setStatus('loading');
    const SERVER = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';

    fetch(`${SERVER}/api/share/${id}`)
      .then(res => {
        if (!res.ok) throw new Error(`Share not found (${res.status})`);
        return res.json();
      })
      .then(data => {
        if (data.code) setCode(data.code);
        if (data.language) setLanguage(data.language);
        if (data.styleSystem) setStyleSystem(data.styleSystem);
        setStatus('loaded');
        // Remove ?share= from URL without reload
        const url = new URL(window.location.href);
        url.searchParams.delete('share');
        window.history.replaceState({}, '', url.toString());
      })
      .catch(err => {
        console.error('[useShareLoader]', err.message);
        setError(err.message);
        setStatus('error');
      });
  // Run only once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, error };
}
