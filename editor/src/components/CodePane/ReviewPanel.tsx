import React from 'react';

interface Props {
  result: string;
  streaming: boolean;
  onClear: () => void;
}

export function ReviewPanel({ result, streaming, onClear }: Props) {
  if (!result && !streaming) return null;

  return (
    <div style={{ borderTop: '1px solid #1e293b', background: '#0a0f1e', flexShrink: 0, maxHeight: 260, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', borderBottom: '1px solid #1e293b' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em' }}>
          CODE REVIEW {streaming && <span style={{ color: '#6366f1', fontWeight: 400 }}>● streaming…</span>}
        </span>
        <button onClick={onClear} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 12 }}>✕</button>
      </div>
      <div style={{ padding: '10px 14px' }}>
        {result.split('\n').map((line, i) => {
          const isBullet = line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ');
          const isHeading = line.startsWith('## ') || line.startsWith('### ') || line.startsWith('**');
          return (
            <div key={i} style={{
              fontSize: 12,
              lineHeight: 1.6,
              color: isHeading ? '#a5b4fc' : isBullet ? '#94a3b8' : '#64748b',
              fontWeight: isHeading ? 600 : 400,
              marginTop: isHeading ? 8 : 0,
              paddingLeft: isBullet ? 0 : 0,
            }}>
              {line || <br />}
            </div>
          );
        })}
        {streaming && <span style={{ color: '#6366f1', fontSize: 12 }}>▌</span>}
      </div>
    </div>
  );
}
