import { useState, useEffect, useCallback } from 'react';
export { INSPECT_SCRIPT } from './useBuildSrcdoc';

export interface InspectInfo {
  tagName: string;
  id: string;
  classes: string[];
  styles: Record<string, string>;
  text: string;
  rect: { width: number; height: number };
}

export function useInspect(enabled: boolean) {
  const [info, setInfo] = useState<InspectInfo | null>(null);

  useEffect(() => {
    if (!enabled) { setInfo(null); return; }

    const handler = (e: MessageEvent) => {
      if (e.data?.type !== 'inspect') return;
      setInfo(e.data.payload as InspectInfo);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [enabled]);

  const dismiss = useCallback(() => setInfo(null), []);

  return { info, dismiss };
}
