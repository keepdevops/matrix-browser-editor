import { useState } from 'react';
import { useFileTabStore } from '../store/fileTabStore';

const SERVER = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';

export function useTestGen() {
  const [loading, setLoading] = useState(false);

  const generateTests = async (code: string, componentName: string, language: string) => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${SERVER}/api/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, componentName, language }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { code: testCode, filename } = await res.json();

      const { openTab, setActiveTab } = useFileTabStore.getState();
      const lang = (language === 'tsx' || language === 'ts') ? 'tsx' : 'jsx';
      const id = openTab({ name: filename ?? `${componentName}.test.tsx`, code: testCode, language: lang });
      setActiveTab(id);
    } catch (err) {
      console.error('[useTestGen]', err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, generateTests };
}
