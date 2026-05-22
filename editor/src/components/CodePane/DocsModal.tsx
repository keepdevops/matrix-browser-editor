import React, { useState } from 'react';

interface Props {
  jsdoc: string;
  readme: string;
  onClose: () => void;
}

export function DocsModal({ jsdoc, readme, onClose }: Props) {
  const [tab, setTab] = useState<'jsdoc' | 'readme'>('jsdoc');
  const [copied, setCopied] = useState(false);

  const content = tab === 'jsdoc' ? jsdoc : readme;

  const copy = () => {
    navigator.clipboard.writeText(content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TAB: React.CSSProperties = { padding: '4px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12 };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, width: 540, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #1e293b' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.05em' }}>DOCS</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={copy} style={{ ...TAB, background: '#1e293b', color: copied ? '#34d399' : '#94a3b8', border: '1px solid #334155' }}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '8px 12px', background: '#0a0f1e' }}>
          {(['jsdoc', 'readme'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...TAB, background: tab === t ? '#1e293b' : 'transparent', color: tab === t ? '#f1f5f9' : '#64748b', fontWeight: tab === t ? 600 : 400 }}>
              {t === 'jsdoc' ? 'JSDoc' : 'README'}
            </button>
          ))}
        </div>

        {/* Content */}
        <pre style={{ flex: 1, overflowY: 'auto', margin: 0, padding: '12px 18px', fontSize: 12, lineHeight: 1.7, color: '#a5b4fc', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#0a0f1e' }}>
          {content || '(empty)'}
        </pre>
      </div>
    </div>
  );
}
