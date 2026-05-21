import { useState, useCallback } from 'react';

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export interface AuditIssue {
  severity: 'error' | 'warning' | 'info';
  element: string;
  message: string;
  fix: string;
}

interface AuditState {
  issues: AuditIssue[];
  loading: boolean;
  error: string | null;
  ran: boolean;
}

export function useAudit() {
  const [state, setState] = useState<AuditState>({ issues: [], loading: false, error: null, ran: false });

  const audit = useCallback(async (code: string, screenshotImage?: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const body: Record<string, string> = { code };
      if (screenshotImage) {
        body.screenshotImage = screenshotImage.replace(/^data:image\/[^;]+;base64,/, '');
      }
      const res = await fetch(`${SERVER}/api/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setState({ issues: data.issues ?? [], loading: false, error: null, ran: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Audit failed';
      console.error('[useAudit]', message);
      setState(s => ({ ...s, loading: false, error: message, ran: true }));
    }
  }, []);

  const clear = useCallback(() => {
    setState({ issues: [], loading: false, error: null, ran: false });
  }, []);

  return { ...state, audit, clear };
}
