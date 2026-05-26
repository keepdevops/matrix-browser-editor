import React from 'react';

const MOD = navigator.platform.includes('Mac') ? '⌘' : 'Ctrl';

const SHORTCUTS = [
  { keys: `${MOD}+S`, action: 'Save to Library' },
  { keys: `${MOD}+P`, action: 'Format with Prettier' },
  { keys: `${MOD}+D`, action: 'Toggle diff view' },
  { keys: `${MOD}+Z`, action: 'Undo' },
  { keys: `${MOD}+Shift+Z / ${MOD}+Y`, action: 'Redo' },
  { keys: `${MOD}+\\`, action: 'Toggle sidebar' },
  { keys: `${MOD}+K`, action: 'Open sidebar (templates)' },
  { keys: `${MOD}+J`, action: 'Toggle chat' },
  { keys: 'Enter', action: 'Send chat prompt' },
  { keys: `${MOD}+Enter`, action: 'Send chat prompt (multiline)' },
  { keys: 'Shift+Enter', action: 'New line in prompt' },
  { keys: '↑ / ↓', action: 'Cycle prompt history' },
  { keys: '?', action: 'Show this help' },
  { keys: 'Esc', action: 'Close drawers / modals' },
];

const FEATURES = [
  {
    icon: '💬',
    title: 'AI Chat',
    desc: 'Describe a component and the AI generates it instantly. Attach a screenshot to edit visually. Select code in the editor and use the inline AI toolbar to edit that selection — review the diff before accepting. Use ↑/↓ to cycle prompt history, ⚗ Variants for 3 style alternatives, and Retry to regenerate.',
  },
  {
    icon: '▶',
    title: 'Live Preview',
    desc: 'See your component render in real time. Use 📱/⊞/⊡ to test responsive widths. ⧉ Split shows mobile + desktop side by side. ◑ Themes compares dark/light. 🔎 Inspect clicks elements to see their computed styles.',
  },
  {
    icon: '</>',
    title: 'Code Editor',
    desc: 'Full Monaco editor with syntax highlighting, undo/redo, Prettier (Cmd+P), and diff mode (Cmd+D). Component tabs focus on one export at a time; file tabs keep multiple components open. Drafts autosave and restore on reload. Open Version History to browse and restore past saves.',
  },
  {
    icon: '🧩',
    title: 'Canvas',
    desc: 'Drag saved library components onto a Puck visual canvas, arrange them, and click "Export to Code" to emit a ComposedPage component.',
  },
  {
    icon: '📚',
    title: 'Library',
    desc: 'Click Save (Cmd+S) to add the current component to your library. Library items appear in the Canvas palette and persist across sessions.',
  },
  {
    icon: '🎨',
    title: 'Tokens',
    desc: 'Design tokens inject CSS variables (--color-primary, --font-family, etc.) into your component. Switch Dark/Light presets, pick a Google Font live, or generate a palette with AI.',
  },
  {
    icon: '✨',
    title: 'Animation',
    desc: 'Pick animation presets (Fade In, Slide Up, Bounce…) and a duration/easing. Click "Inject" to add @keyframes + CSS classes directly into your component.',
  },
  {
    icon: '⬇',
    title: 'Export',
    desc: 'Download as .tsx/.jsx, ZIP, or push to a GitHub Gist. Generate AI tests (🧪), docs (📄), or Storybook stories (📖). Share a link via 🔗 Share; copy the embed snippet after sharing. Inject into an existing file or export to your filesystem via the Connector.',
  },
  {
    icon: '🔍',
    title: 'Review',
    desc: 'Click 🔍 Review to stream a full AI code review of the current component — suggestions, accessibility notes, and potential issues.',
  },
  {
    icon: '🔌',
    title: 'Connector',
    desc: 'Link a local project path in the Connector panel (🔌 sidebar tab). Use "Export to filesystem" in the Export menu to push code directly to that file.',
  },
  {
    icon: '🤖',
    title: 'Model',
    desc: 'Switch AI backends in the Model panel (🤖 sidebar tab): Auto (llama.cpp → Swarm → Claude), llama.cpp, Swarm, or Claude. Live status indicators show which servers are online.',
  },
  {
    icon: '📸',
    title: 'Screenshots',
    desc: 'Capture the live preview as a PNG, then "Edit with AI" to describe visual changes. Screenshots are saved to the Snapshots panel (📷) for later restore.',
  },
];

interface Props {
  onClose: () => void;
}

type Tab = 'shortcuts' | 'guide';

export function KeyboardHelpModal({ onClose }: Props) {
  const [tab, setTab] = React.useState<Tab>('guide');

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const TAB_BTN = (active: boolean): React.CSSProperties => ({
    padding: '4px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12,
    background: active ? '#1e293b' : 'transparent',
    color: active ? '#f1f5f9' : '#64748b',
    fontWeight: active ? 600 : 400,
  });

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0f172a', border: '1px solid #334155', borderRadius: 12,
          padding: '20px 24px', width: 500, maxHeight: '82vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.05em' }}>
            MATRIX EDITOR — HELP
          </span>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16, padding: 0 }}
          >✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#0a0f1e', borderRadius: 8, padding: 3 }}>
          <button style={TAB_BTN(tab === 'guide')} onClick={() => setTab('guide')}>📖 Feature Guide</button>
          <button style={TAB_BTN(tab === 'shortcuts')} onClick={() => setTab('shortcuts')}>⌨ Shortcuts</button>
        </div>

        {tab === 'guide' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: 12, padding: '10px 12px', background: '#1e293b', borderRadius: 8, border: '1px solid #334155' }}>
                <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1.4 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 3 }}>{title}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'shortcuts' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', alignItems: 'center' }}>
            {SHORTCUTS.map(({ keys, action }) => (
              <React.Fragment key={keys}>
                <kbd style={{
                  fontFamily: 'monospace', fontSize: 11, color: '#a5b4fc',
                  background: '#1e293b', border: '1px solid #334155',
                  borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap',
                }}>{keys}</kbd>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{action}</span>
              </React.Fragment>
            ))}
          </div>
        )}

        <div style={{ fontSize: 11, color: '#475569', textAlign: 'center', borderTop: '1px solid #1e293b', paddingTop: 12 }}>
          Press <kbd style={{ fontFamily: 'monospace', color: '#a5b4fc', background: '#1e293b', border: '1px solid #334155', borderRadius: 4, padding: '1px 5px' }}>?</kbd> anywhere or <kbd style={{ fontFamily: 'monospace', color: '#a5b4fc', background: '#1e293b', border: '1px solid #334155', borderRadius: 4, padding: '1px 5px' }}>Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
