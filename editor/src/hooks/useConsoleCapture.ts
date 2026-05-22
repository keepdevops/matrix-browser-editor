import { useState, useEffect, useCallback } from 'react';

export type LogLevel = 'log' | 'warn' | 'error' | 'info';

export interface LogEntry {
  id: number;
  level: LogLevel;
  args: string[];
  timestamp: number;
}

const MAX_ENTRIES = 100;
let nextId = 1;

export function useConsoleCapture(active: boolean) {
  const [entries, setEntries] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (!active) return;
    const handler = (e: MessageEvent) => {
      if (e.data?.type !== 'console') return;
      const { level, args } = e.data as { level: LogLevel; args: string[] };
      setEntries(prev => {
        const next = [...prev, { id: nextId++, level, args, timestamp: Date.now() }];
        return next.length > MAX_ENTRIES ? next.slice(next.length - MAX_ENTRIES) : next;
      });
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [active]);

  // Clear on code change — caller passes a reset token (e.g. code hash)
  const clear = useCallback(() => setEntries([]), []);

  return { entries, clear };
}
