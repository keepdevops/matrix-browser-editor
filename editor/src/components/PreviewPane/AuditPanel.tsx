import type { AuditIssue } from '../../hooks/useAudit';
import { useSessionStore } from '../../store/sessionStore';

const SEVERITY_ICON: Record<AuditIssue['severity'], string> = {
  error: '🔴',
  warning: '🟡',
  info: '🔵',
};

const SEVERITY_ORDER: Record<AuditIssue['severity'], number> = { error: 0, warning: 1, info: 2 };

interface AuditPanelProps {
  issues: AuditIssue[];
  error: string | null;
  onClear: () => void;
}

export function AuditPanel({ issues, error, onClear }: AuditPanelProps) {
  const { setPendingChatMessage, setRightTab } = useSessionStore();

  const sorted = [...issues].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  const counts = { error: 0, warning: 0, info: 0 };
  for (const i of issues) counts[i.severity]++;

  const handleFix = (issue: AuditIssue) => {
    setPendingChatMessage(
      `Fix this accessibility issue on <${issue.element}>: ${issue.message}. Apply this fix: ${issue.fix}`
    );
    setRightTab('code');
  };

  return (
    <div style={{ borderTop: '1px solid #1e293b', background: '#0a0f1e', flexShrink: 0, maxHeight: 260, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, background: '#0a0f1e', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.06em' }}>A11Y AUDIT</span>
          {counts.error > 0 && <span style={{ fontSize: 10, color: '#f87171' }}>🔴 {counts.error}</span>}
          {counts.warning > 0 && <span style={{ fontSize: 10, color: '#fbbf24' }}>🟡 {counts.warning}</span>}
          {counts.info > 0 && <span style={{ fontSize: 10, color: '#60a5fa' }}>🔵 {counts.info}</span>}
          {issues.length === 0 && !error && <span style={{ fontSize: 10, color: '#22c55e' }}>✓ No issues found</span>}
        </div>
        <button onClick={onClear} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 11 }}>✕</button>
      </div>

      {error && (
        <div style={{ padding: '8px 12px', color: '#f87171', fontSize: 12 }}>Error: {error}</div>
      )}

      {sorted.map((issue, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, padding: '7px 12px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
              <span style={{ fontSize: 11 }}>{SEVERITY_ICON[issue.severity]}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#cbd5e1', fontFamily: 'monospace' }}>&lt;{issue.element}&gt;</span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>{issue.message}</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#475569', lineHeight: 1.4 }}>{issue.fix}</p>
          </div>
          <button
            onClick={() => handleFix(issue)}
            style={{
              flexShrink: 0,
              padding: '3px 10px',
              borderRadius: 6,
              background: 'transparent',
              border: '1px solid #4f46e5',
              color: '#a5b4fc',
              cursor: 'pointer',
              fontSize: 11,
              whiteSpace: 'nowrap',
            }}
          >
            Fix
          </button>
        </div>
      ))}
    </div>
  );
}
