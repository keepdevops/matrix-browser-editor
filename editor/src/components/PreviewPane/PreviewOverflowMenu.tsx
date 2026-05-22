import { useState, useRef, useEffect } from 'react';

interface OverflowAction {
  label: string;
  active?: boolean;
  disabled?: boolean;
  color?: string;
  borderColor?: string;
  onClick: () => void;
}

interface Props {
  actions: OverflowAction[];
}

const BTN: React.CSSProperties = {
  padding: '3px 10px', borderRadius: 6, background: '#1e293b',
  border: '1px solid #334155', color: '#94a3b8', cursor: 'pointer', fontSize: 12,
};

export function PreviewOverflowMenu({ actions }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onMouse);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouse);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const activeCount = actions.filter(a => a.active).length;

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="More tools"
        style={{
          ...BTN,
          color: open || activeCount > 0 ? '#a5b4fc' : '#94a3b8',
          borderColor: open || activeCount > 0 ? '#4f46e5' : '#334155',
          background: open || activeCount > 0 ? 'rgba(99,102,241,0.15)' : '#1e293b',
          padding: '3px 8px',
          display: 'flex', alignItems: 'center', gap: 3,
        }}
      >
        ⋯{activeCount > 0 && <span style={{ fontSize: 9, background: '#6366f1', color: '#fff', borderRadius: 8, padding: '0 4px', marginLeft: 1 }}>{activeCount}</span>}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', right: 0,
          background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 200,
          minWidth: 180, overflow: 'hidden',
        }}>
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => { action.onClick(); setOpen(false); }}
              disabled={action.disabled}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '8px 14px',
                background: action.active ? 'rgba(99,102,241,0.1)' : 'transparent',
                border: 'none',
                borderLeft: action.active ? '2px solid #6366f1' : '2px solid transparent',
                color: action.disabled ? '#475569' : action.color ?? '#cbd5e1',
                cursor: action.disabled ? 'not-allowed' : 'pointer',
                fontSize: 12, textAlign: 'left',
              }}
              onMouseEnter={e => { if (!action.disabled) (e.currentTarget as HTMLButtonElement).style.background = '#1e293b'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = action.active ? 'rgba(99,102,241,0.1)' : 'transparent'; }}
            >
              {action.label}
              {action.active && <span style={{ fontSize: 10, color: '#6366f1' }}>●</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
