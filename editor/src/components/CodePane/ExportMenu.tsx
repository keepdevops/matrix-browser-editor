import { useState, useRef, useEffect } from 'react';

interface ExportAction {
  label: string;
  icon: string;
  title?: string;
  disabled?: boolean;
  loading?: boolean;
  color?: string;
  onClick: () => void;
}

interface ExportMenuProps {
  disabled?: boolean;
  actions: ExportAction[];
}

const BTN: React.CSSProperties = {
  padding: '3px 10px', borderRadius: 6, background: '#1e293b',
  border: '1px solid #334155', color: '#94a3b8', cursor: 'pointer', fontSize: 12,
};

export function ExportMenu({ disabled, actions }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={disabled}
        title="Export options"
        style={{
          ...BTN,
          opacity: disabled ? 0.5 : 1,
          color: open ? '#a5b4fc' : '#94a3b8',
          borderColor: open ? '#4f46e5' : '#334155',
          background: open ? 'rgba(99,102,241,0.15)' : '#1e293b',
          display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        ⬇ Export <span style={{ fontSize: 9, opacity: 0.7 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', right: 0,
          background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 200,
          minWidth: 200, overflow: 'hidden',
        }}>
          {actions.map((action, i) => (
            action.label === '---' ? (
              <div key={i} style={{ height: 1, background: '#1e293b', margin: '2px 0' }} />
            ) : (
              <button
                key={i}
                onClick={() => { if (!action.disabled && !action.loading) { action.onClick(); setOpen(false); } }}
                disabled={action.disabled || action.loading}
                title={action.title}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '8px 14px',
                  background: 'transparent', border: 'none',
                  color: action.disabled || action.loading ? '#475569' : action.color ?? '#cbd5e1',
                  cursor: action.disabled || action.loading ? 'not-allowed' : 'pointer',
                  fontSize: 12, textAlign: 'left',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!action.disabled && !action.loading) (e.currentTarget as HTMLButtonElement).style.background = '#1e293b'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 14, width: 18, textAlign: 'center', flexShrink: 0 }}>
                  {action.loading ? '⏳' : action.icon}
                </span>
                {action.label}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
}
