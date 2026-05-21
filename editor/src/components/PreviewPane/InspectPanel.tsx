import type { InspectInfo } from '../../hooks/useInspect';

const STYLE_KEYS = [
  'color', 'background-color', 'font-size', 'font-family',
  'padding', 'margin', 'border-radius', 'display', 'width', 'height',
];

interface Props {
  info: InspectInfo;
  onDismiss: () => void;
}

export function InspectPanel({ info, onDismiss }: Props) {
  const tag = `<${info.tagName}${info.id ? ` id="${info.id}"` : ''}${info.classes.length ? ` class="${info.classes.join(' ')}"` : ''}>`;

  return (
    <div style={{
      position: 'absolute', bottom: 12, right: 12, zIndex: 40,
      background: '#0f172a', border: '1px solid #334155', borderRadius: 10,
      padding: '10px 14px', width: 280, maxHeight: 360, overflowY: 'auto',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <code style={{ fontSize: 11, color: '#34d399', fontWeight: 600 }}>{tag}</code>
        <button
          onClick={onDismiss}
          style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}
        >✕</button>
      </div>

      {info.text && (
        <div style={{ marginBottom: 8, fontSize: 11, color: '#94a3b8', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          "{info.text}"
        </div>
      )}

      <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {info.rect.width} × {info.rect.height}px
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {STYLE_KEYS.map(key => {
          const val = info.styles[key];
          if (!val || val === 'none' || val === 'normal' || val === 'auto') return null;
          return (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>{key}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {(key === 'color' || key === 'background-color') && val.startsWith('rgb') && (
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: val, border: '1px solid #334155', flexShrink: 0 }} />
                )}
                <span style={{ fontSize: 10, color: '#cbd5e1', fontFamily: 'monospace', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {val}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {info.classes.length > 0 && (
        <div style={{ marginTop: 8, borderTop: '1px solid #1e293b', paddingTop: 8 }}>
          <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Classes</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {info.classes.map(cls => (
              <span key={cls} style={{ fontSize: 10, padding: '1px 6px', background: '#1e293b', borderRadius: 4, color: '#a5b4fc', fontFamily: 'monospace' }}>
                .{cls}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
