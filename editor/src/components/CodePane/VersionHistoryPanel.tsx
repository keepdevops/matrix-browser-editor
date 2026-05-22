import { useState } from 'react';
import { useHistoryStore, type VersionEntry, type VersionSource } from '../../store/historyStore';
import { useEditorStore } from '../../store/editorStore';
import { DiffTooltip } from './DiffTooltip';

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const SOURCE_LABEL: Record<VersionSource, string> = {
  ai: '⚡ AI',
  save: '💾 Saved',
  manual: '📌 Manual',
};

const SOURCE_COLOR: Record<VersionSource, string> = {
  ai: '#818cf8',
  save: '#34d399',
  manual: '#fbbf24',
};

interface Props {
  onClose: () => void;
}

export function VersionHistoryPanel({ onClose }: Props) {
  const { entries, remove, clear } = useHistoryStore();
  const { code: currentCode, setCode, setComponentName, setLanguage } = useEditorStore();
  const [confirmClear, setConfirmClear] = useState(false);
  const [hovered, setHovered] = useState<{ entry: VersionEntry; top: number } | null>(null);

  const handleRestore = (entry: VersionEntry) => {
    setCode(entry.code);
    setComponentName(entry.componentName);
    setLanguage(entry.language as 'tsx' | 'jsx' | 'ts' | 'js');
    onClose();
  };

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0, width: 300,
      background: '#0a0f1e', borderLeft: '1px solid #1e293b',
      display: 'flex', flexDirection: 'column', zIndex: 20,
      boxShadow: '-4px 0 16px rgba(0,0,0,0.4)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderBottom: '1px solid #1e293b', flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>VERSION HISTORY</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {entries.length > 0 && (
            confirmClear ? (
              <>
                <button onClick={() => { clear(); setConfirmClear(false); }} style={DANGER_BTN}>Confirm</button>
                <button onClick={() => setConfirmClear(false)} style={GHOST_BTN}>Cancel</button>
              </>
            ) : (
              <button onClick={() => setConfirmClear(true)} style={GHOST_BTN} title="Clear all history">Clear</button>
            )
          )}
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>✕</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {entries.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: '#475569', fontSize: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🕐</div>
            No history yet.<br />Versions are captured on AI generation and Save.
          </div>
        ) : entries.map((entry) => (
          <div key={entry.id} style={{
            padding: '8px 14px', borderBottom: '1px solid #0f172a',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#111827'; setHovered({ entry, top: e.currentTarget.getBoundingClientRect().top }); }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; setHovered(null); }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: SOURCE_COLOR[entry.source] }}>
                  {SOURCE_LABEL[entry.source]}
                </span>
                <span style={{ fontSize: 10, color: '#475569' }}>{timeAgo(entry.timestamp)}</span>
              </div>
              <div style={{ fontSize: 11, color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={entry.label ?? entry.componentName}>
                {entry.label ? entry.label.slice(0, 60) + (entry.label.length > 60 ? '…' : '') : entry.componentName}
              </div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>
                {entry.componentName} · {entry.code.split('\n').length} lines · {entry.language}
              </div>
            </div>
            <button
              onClick={() => handleRestore(entry)}
              title="Restore this version"
              style={RESTORE_BTN}
            >
              ↺
            </button>
            <button
              onClick={() => remove(entry.id)}
              title="Remove entry"
              style={{ background: 'none', border: 'none', color: '#334155', cursor: 'pointer', fontSize: 12, padding: '2px 4px' }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {hovered && (
        <DiffTooltip
          oldCode={currentCode}
          newCode={hovered.entry.code}
          anchorTop={hovered.top}
        />
      )}
    </div>
  );
}

const GHOST_BTN: React.CSSProperties = {
  padding: '2px 8px', borderRadius: 5, background: 'transparent',
  border: '1px solid #334155', color: '#64748b', cursor: 'pointer', fontSize: 11,
};
const DANGER_BTN: React.CSSProperties = { ...GHOST_BTN, borderColor: '#7f1d1d', color: '#f87171' };
const RESTORE_BTN: React.CSSProperties = {
  flexShrink: 0, padding: '3px 8px', borderRadius: 5,
  background: 'transparent', border: '1px solid #334155',
  color: '#94a3b8', cursor: 'pointer', fontSize: 13,
};
