import { useState } from 'react';
import { useFileTabStore } from '../store/fileTabStore';

const SERVER = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';

export function useStorybookExport() {
  const [loading, setLoading] = useState(false);

  const exportStories = async (code: string, componentName: string) => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${SERVER}/api/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, componentName }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { code: storiesCode, filename } = await res.json();

      const { openTab, setActiveTab } = useFileTabStore.getState();
      const id = openTab({ name: filename ?? `${componentName}.stories.tsx`, code: storiesCode, language: 'tsx' });
      setActiveTab(id);
    } catch (err) {
      console.error('[useStorybookExport]', err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, exportStories };
}
