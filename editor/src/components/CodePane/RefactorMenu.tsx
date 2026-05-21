import { useState, useRef, useEffect } from 'react';

const REFACTORS = [
  { label: 'Split into components', prompt: 'Split this component into smaller, focused sub-components. Keep the main component as the entry point and extract logical sections into separate named exports.' },
  { label: 'Convert to TypeScript', prompt: 'Convert this component to strict TypeScript. Add proper interface/type definitions for all props, state, and function signatures. Use specific types, not any.' },
  { label: 'Add unit tests', prompt: 'Generate a Jest + React Testing Library test file for this component. Cover: renders without crashing, key user interactions, edge cases, and accessibility queries.' },
  { label: 'Extract custom hook', prompt: 'Extract all stateful logic and side effects from this component into a custom React hook. The component should only handle rendering.' },
  { label: 'Add error boundary', prompt: 'Wrap this component with an error boundary. Add graceful fallback UI and error logging.' },
  { label: 'Make accessible', prompt: 'Improve the accessibility of this component: add ARIA labels, roles, keyboard navigation, focus management, and ensure WCAG 2.1 AA compliance.' },
  { label: 'Add loading & error states', prompt: 'Add proper loading spinner and error state UI to this component. Use realistic async patterns with useState for loading/error/data.' },
  { label: 'Convert to dark mode', prompt: 'Update this component to fully support dark mode. Use CSS variables or Tailwind dark: classes. Ensure contrast ratios meet WCAG AA.' },
];

interface RefactorMenuProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function RefactorMenu({ onSelect, disabled }: RefactorMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={disabled}
        style={{
          padding: '3px 10px', borderRadius: 6, background: open ? '#312e81' : '#1e293b',
          border: `1px solid ${open ? '#6366f1' : '#334155'}`, color: open ? '#a5b4fc' : '#94a3b8',
          cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 12,
          opacity: disabled ? 0.4 : 1,
        }}
      >
        ⚙ Refactor ▾
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, zIndex: 200, marginTop: 4,
          background: '#1e293b', border: '1px solid #334155', borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)', minWidth: 220, overflow: 'hidden',
        }}>
          {REFACTORS.map(({ label, prompt }) => (
            <button
              key={label}
              onClick={() => { onSelect(prompt); setOpen(false); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 14px', background: 'transparent',
                border: 'none', borderBottom: '1px solid #1e293b',
                color: '#cbd5e1', cursor: 'pointer', fontSize: 12,
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
