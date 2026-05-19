

type Status = 'idle' | 'loading' | 'success' | 'error';

interface StatusBadgeProps {
  status: Status;
  message?: string;
}

const statusConfig: Record<Status, { bg: string; dot: string; text: string }> = {
  idle: { bg: 'rgba(255,255,255,0.05)', dot: '#6b7280', text: '#9ca3af' },
  loading: { bg: 'rgba(99,102,241,0.15)', dot: '#6366f1', text: '#a5b4fc' },
  success: { bg: 'rgba(34,197,94,0.15)', dot: '#22c55e', text: '#86efac' },
  error: { bg: 'rgba(239,68,68,0.15)', dot: '#ef4444', text: '#fca5a5' },
};

export function StatusBadge({ status, message }: StatusBadgeProps) {
  const cfg = statusConfig[status];

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '3px 10px',
      borderRadius: '999px',
      background: cfg.bg,
      fontSize: '11px',
      fontWeight: 500,
      color: cfg.text,
    }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: cfg.dot,
        animation: status === 'loading' ? 'pulse 1.2s ease-in-out infinite' : undefined,
      }} />
      {message || status}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </span>
  );
}
