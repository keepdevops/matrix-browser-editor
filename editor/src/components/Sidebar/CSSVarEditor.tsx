import { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';

function extractRootBlock(code: string): string {
  const match = code.match(/:root\s*\{[^}]*\}/s);
  return match ? match[0] : '';
}

function replaceRootBlock(code: string, newBlock: string): string {
  if (/:root\s*\{[^}]*\}/s.test(code)) {
    return code.replace(/:root\s*\{[^}]*\}/s, newBlock);
  }
  return newBlock + '\n\n' + code;
}

export function CSSVarEditor() {
  const { code, setCode } = useEditorStore();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) setDraft(extractRootBlock(code) || ':root {\n  \n}');
  // Only sync when opening, not on every code change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const apply = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || !code.trim()) return;
    setCode(replaceRootBlock(code, trimmed));
  };

  const handleChange = (value: string) => {
    setDraft(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => apply(value), 400);
  };

  return (
    <div style={{ borderTop: '1px solid #1e293b', marginTop: 6 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '6px 12px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 10 }}
      >
        <span>{open ? '▾' : '▸'}</span>
        <span style={{ fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>CSS Var Editor</span>
        <span style={{ color: '#334155', fontSize: 10 }}>raw :root block</span>
      </button>

      {open && (
        <div style={{ padding: '0 12px 10px' }}>
          <textarea
            value={draft}
            onChange={e => handleChange(e.target.value)}
            spellCheck={false}
            style={{
              width: '100%', minHeight: 120, background: '#0a0f1e',
              border: '1px solid #334155', borderRadius: 6,
              padding: '8px 10px', color: '#a5b4fc', fontSize: 11,
              fontFamily: 'monospace', lineHeight: 1.6, resize: 'vertical',
              boxSizing: 'border-box', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <button
              onClick={() => apply(draft)}
              style={{ padding: '3px 10px', borderRadius: 4, background: '#4f46e5', border: '1px solid #6366f1', color: '#fff', cursor: 'pointer', fontSize: 11 }}
            >Apply</button>
            <span style={{ fontSize: 10, color: '#334155', alignSelf: 'center' }}>auto-applies after 400ms</span>
          </div>
        </div>
      )}
    </div>
  );
}
