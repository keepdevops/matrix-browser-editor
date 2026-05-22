import { useState } from 'react';
import { useFileTabStore } from '../store/fileTabStore';
import { useEditorStore } from '../store/editorStore';

const SERVER = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3000';

export function useExportZip() {
  const [loading, setLoading] = useState(false);

  const exportZip = async () => {
    const { tabs } = useFileTabStore.getState();
    const { code, componentName, language } = useEditorStore.getState();

    const files = tabs.length > 0
      ? tabs.map(t => ({ name: t.name, code: t.code, language: t.language }))
      : [{ name: componentName || 'Component', code, language }];

    const nonEmpty = files.filter(f => f.code.trim());
    if (!nonEmpty.length) return;

    setLoading(true);
    try {
      const res = await fetch(`${SERVER}/api/zip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: nonEmpty }),
      });
      if (!res.ok) { console.error('[useExportZip] server error:', res.status); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'components.zip';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      console.error('[useExportZip] failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, exportZip };
}
