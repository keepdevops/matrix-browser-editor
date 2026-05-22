import React, { useState, useMemo } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { extractProps, parseComponents } from '../../lib/parseComponents';
import type { PropDef } from '../../lib/parseComponents';

interface Props {
  onPropsChange: (props: Record<string, unknown>) => void;
}

export function PropControlsPanel({ onPropsChange }: Props) {
  const { code } = useEditorStore();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>({});

  const propDefs = useMemo<PropDef[]>(() => {
    const components = parseComponents(code);
    if (!components.length) return [];
    return extractProps(components[0].code);
  }, [code]);

  if (!propDefs.length) return null;

  const handleChange = (name: string, val: unknown) => {
    const next = { ...values, [name]: val };
    setValues(next);
    onPropsChange(next);
  };

  const BTN: React.CSSProperties = {
    padding: '2px 8px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 11,
    background: 'transparent', color: '#475569',
  };

  return (
    <div style={{ borderTop: '1px solid #1e293b', background: '#0a0f1e', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '5px 12px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 11 }}
      >
        <span style={{ fontSize: 10 }}>{open ? '▾' : '▸'}</span>
        <span style={{ fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Prop Controls</span>
        <span style={{ color: '#334155' }}>({propDefs.length} props detected)</span>
      </button>

      {open && (
        <div style={{ padding: '8px 12px 10px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {propDefs.map(({ name, type, defaultValue }) => {
            const val = values[name] ?? defaultValue ?? '';
            return (
              <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 100 }}>
                <label style={{ fontSize: 10, color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>{name}</label>
                {type === 'boolean' ? (
                  <button
                    onClick={() => handleChange(name, !val)}
                    style={{ ...BTN, background: val ? 'rgba(99,102,241,0.2)' : '#1e293b', border: `1px solid ${val ? '#6366f1' : '#334155'}`, color: val ? '#a5b4fc' : '#64748b', padding: '3px 10px' }}
                  >
                    {val ? 'true' : 'false'}
                  </button>
                ) : type === 'color' ? (
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <input type="color" value={String(val || '#6366f1')} onChange={e => handleChange(name, e.target.value)}
                      style={{ width: 28, height: 24, border: 'none', padding: 0, cursor: 'pointer', background: 'transparent' }} />
                    <input type="text" value={String(val)} onChange={e => handleChange(name, e.target.value)}
                      style={{ width: 68, background: '#1e293b', border: '1px solid #334155', borderRadius: 4, padding: '2px 5px', color: '#f1f5f9', fontSize: 11, fontFamily: 'monospace' }} />
                  </div>
                ) : type === 'number' ? (
                  <input type="number" value={Number(val)} onChange={e => handleChange(name, parseFloat(e.target.value) || 0)}
                    style={{ width: 72, background: '#1e293b', border: '1px solid #334155', borderRadius: 4, padding: '3px 6px', color: '#f1f5f9', fontSize: 11 }} />
                ) : (
                  <input type="text" value={String(val)} onChange={e => handleChange(name, e.target.value)}
                    style={{ width: 120, background: '#1e293b', border: '1px solid #334155', borderRadius: 4, padding: '3px 6px', color: '#f1f5f9', fontSize: 11 }} />
                )}
              </div>
            );
          })}
          <div style={{ alignSelf: 'flex-end' }}>
            <button
              onClick={() => { setValues({}); onPropsChange({}); }}
              style={{ ...BTN, background: '#1e293b', border: '1px solid #334155', color: '#64748b', padding: '3px 8px' }}
            >Reset</button>
          </div>
        </div>
      )}
    </div>
  );
}
