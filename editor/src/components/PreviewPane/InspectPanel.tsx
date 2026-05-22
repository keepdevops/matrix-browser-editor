import React from 'react';
import type { InspectInfo } from '../../hooks/useInspect';

const STYLE_KEYS = [
  'color', 'background-color', 'font-size', 'font-family',
  'padding', 'margin', 'border-radius', 'display', 'width', 'height',
];

const EDITABLE_TAGS = new Set(['button', 'a', 'input', 'label', 'span', 'p', 'h1', 'h2', 'h3', 'li']);

const BTN: React.CSSProperties = {
  padding: '4px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
  border: '1px solid #334155', background: '#1e293b', color: '#94a3b8',
};

interface Props {
  info: InspectInfo;
  onDismiss: () => void;
  onApplyEdit: (outerHTML: string, instruction: string) => Promise<void>;
  applying: boolean;
}

export function InspectPanel({ info, onDismiss, onApplyEdit, applying }: Props) {
  const tag = `<${info.tagName}${info.id ? ` id="${info.id}"` : ''}${info.classes.length ? ` class="${info.classes.join(' ')}"` : ''}>`;
  const isEditable = EDITABLE_TAGS.has(info.tagName);

  const [labelVal, setLabelVal] = React.useState(info.text);
  const [classVal, setClassVal] = React.useState(info.classes.join(' '));
  const [instruction, setInstruction] = React.useState('');

  // Reset fields when inspected element changes
  React.useEffect(() => {
    setLabelVal(info.text);
    setClassVal(info.classes.join(' '));
    setInstruction('');
  }, [info.outerHTML]);

  const buildInstruction = () => {
    const parts: string[] = [];
    if (labelVal !== info.text && info.text) parts.push(`change the text/label to "${labelVal}"`);
    if (classVal !== info.classes.join(' ')) parts.push(`replace className with "${classVal}"`);
    if (instruction.trim()) parts.push(instruction.trim());
    return parts.join('; ') || instruction.trim();
  };

  const handleApply = async () => {
    const inst = buildInstruction();
    if (!inst) return;
    await onApplyEdit(info.outerHTML, inst);
  };

  return (
    <div style={{
      position: 'absolute', bottom: 12, right: 12, zIndex: 40,
      background: '#0f172a', border: '1px solid #334155', borderRadius: 10,
      padding: '10px 14px', width: 300, maxHeight: 480, overflowY: 'auto',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <code style={{ fontSize: 11, color: '#34d399', fontWeight: 600 }}>{tag}</code>
        <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>✕</button>
      </div>

      {/* Dimensions */}
      <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {info.rect.width} × {info.rect.height}px
      </div>

      {/* Visual edit section for editable elements */}
      {isEditable && (
        <div style={{ marginBottom: 10, padding: '8px 10px', background: '#0a1628', borderRadius: 8, border: '1px solid #1e3a5f' }}>
          <div style={{ fontSize: 10, color: '#60a5fa', fontWeight: 700, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            ✏ Edit Element
          </div>

          {info.tagName !== 'input' && (
            <label style={{ display: 'block', marginBottom: 6 }}>
              <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>Label / text</div>
              <input
                value={labelVal}
                onChange={e => setLabelVal(e.target.value)}
                style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: 4, color: '#f1f5f9', fontSize: 11, padding: '3px 6px', outline: 'none', boxSizing: 'border-box' }}
              />
            </label>
          )}

          <label style={{ display: 'block', marginBottom: 6 }}>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>CSS classes</div>
            <input
              value={classVal}
              onChange={e => setClassVal(e.target.value)}
              placeholder="e.g. bg-blue-500 text-white rounded"
              style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: 4, color: '#f1f5f9', fontSize: 11, padding: '3px 6px', outline: 'none', boxSizing: 'border-box' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>Custom instruction (optional)</div>
            <input
              value={instruction}
              onChange={e => setInstruction(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleApply(); }}
              placeholder="e.g. make it red and rounded"
              style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: 4, color: '#f1f5f9', fontSize: 11, padding: '3px 6px', outline: 'none', boxSizing: 'border-box' }}
            />
          </label>

          <button
            onClick={handleApply}
            disabled={applying}
            style={{ ...BTN, background: applying ? '#1e293b' : '#4f46e5', borderColor: '#4f46e5', color: applying ? '#475569' : '#fff', width: '100%' }}
          >
            {applying ? '⏳ Applying…' : '✓ Apply with AI'}
          </button>
        </div>
      )}

      {/* Computed styles */}
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

      {/* Classes */}
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
