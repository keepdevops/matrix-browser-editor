import { DiffEditor } from '@monaco-editor/react';

interface Props {
  label: string;
  oldCode: string;
  newCode: string;
  language?: string;
  onAccept: () => void;
  onReject: () => void;
}

const BTN: React.CSSProperties = {
  padding: '6px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600,
  cursor: 'pointer', border: '1px solid #334155',
};

export function AiDiffModal({ label, oldCode, newCode, language = 'typescript', onAccept, onReject }: Props) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', background: '#0a0f1e',
        borderBottom: '1px solid #1e293b', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>
            AI SUGGESTED CHANGE
          </span>
          {label && (
            <span style={{
              fontSize: 11, padding: '1px 8px', borderRadius: 4,
              background: '#1e293b', color: '#64748b',
            }}>{label}</span>
          )}
          <span style={{ fontSize: 11, color: '#475569' }}>
            Review the diff below, then accept or reject.
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onReject}
            style={{ ...BTN, background: '#1e293b', color: '#94a3b8' }}
          >
            ✕ Reject
          </button>
          <button
            onClick={onAccept}
            style={{ ...BTN, background: '#16a34a', border: '1px solid #16a34a', color: '#fff' }}
          >
            ✓ Accept
          </button>
        </div>
      </div>

      {/* Diff editor */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <DiffEditor
          height="100%"
          language={language}
          theme="vs-dark"
          original={oldCode}
          modified={newCode}
          options={{
            readOnly: true,
            renderSideBySide: true,
            minimap: { enabled: false },
            fontSize: 13,
            scrollBeyondLastLine: false,
            diffWordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
}
