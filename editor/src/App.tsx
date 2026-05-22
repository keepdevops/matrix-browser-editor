import { useState, useEffect } from 'react';
import { ChatPane } from './components/ChatPane/ChatPane';
import { PreviewPane } from './components/PreviewPane/PreviewPane';
import { CodePane } from './components/CodePane/CodePane';
import { Sidebar } from './components/Sidebar/Sidebar';
import { CanvasPane } from './components/CanvasPane/CanvasPane';
import { KeyboardHelpModal } from './components/shared/KeyboardHelpModal';

const TOP_H = 44;

const NAV_BTN = (active = false): React.CSSProperties => ({
  padding: '5px 12px',
  background: active ? '#1e293b' : 'transparent',
  border: 'none',
  borderRadius: 6,
  color: active ? '#f1f5f9' : '#475569',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: active ? 600 : 400,
  whiteSpace: 'nowrap' as const,
  letterSpacing: '0.03em',
  transition: 'all 0.12s',
});

const ICON_BTN: React.CSSProperties = {
  padding: '5px 10px',
  background: 'transparent',
  border: 'none',
  color: '#475569',
  cursor: 'pointer',
  fontSize: 15,
  borderRadius: 6,
  lineHeight: 1,
};

type Drawer = 'sidebar' | 'chat' | null;

export default function App() {
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [canvasMode, setCanvasMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const toggle = (d: Drawer) => setDrawer(prev => prev === d ? null : d);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === '?') setShowHelp(h => !h);
      if (e.key === 'Escape') setDrawer(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {showHelp && <KeyboardHelpModal onClose={() => setShowHelp(false)} />}

      {/* Backdrop for drawers */}
      {drawer && (
        <div
          onClick={() => setDrawer(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 99,
            background: 'rgba(0,0,0,0.45)',
          }}
        />
      )}

      {/* Sidebar drawer */}
      <div style={{
        position: 'fixed', left: 0, top: TOP_H,
        height: `calc(100vh - ${TOP_H}px)`, width: 280,
        zIndex: 100, background: '#0a0f1e',
        borderRight: '1px solid #334155',
        transform: drawer === 'sidebar' ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.2s ease',
        boxShadow: drawer === 'sidebar' ? '4px 0 24px rgba(0,0,0,0.5)' : 'none',
        overflow: 'hidden',
      }}>
        <Sidebar />
      </div>

      {/* Chat drawer */}
      <div style={{
        position: 'fixed', left: 0, top: TOP_H,
        height: `calc(100vh - ${TOP_H}px)`, width: 380,
        zIndex: 100, background: '#0a0f1e',
        borderRight: '1px solid #334155',
        transform: drawer === 'chat' ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.2s ease',
        boxShadow: drawer === 'chat' ? '4px 0 24px rgba(0,0,0,0.5)' : 'none',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        <ChatPane />
      </div>

      {/* Main app shell */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        height: '100vh', overflow: 'hidden',
        background: '#0f172a', color: '#f1f5f9',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        {/* Top navigation bar */}
        <div style={{
          height: TOP_H, flexShrink: 0,
          display: 'flex', alignItems: 'center',
          padding: '0 8px',
          background: '#0a0f1e',
          borderBottom: '1px solid #1e293b',
          gap: 4,
        }}>
          {/* Left: drawer toggles */}
          <button
            onClick={() => toggle('sidebar')}
            title="Tools & Settings"
            style={{ ...ICON_BTN, color: drawer === 'sidebar' ? '#a5b4fc' : '#475569', fontSize: 18 }}
          >
            ☰
          </button>
          <button
            onClick={() => toggle('chat')}
            title="AI Chat"
            style={{ ...NAV_BTN(drawer === 'chat') }}
          >
            💬 Chat
          </button>

          <div style={{ width: 1, height: 20, background: '#1e293b', margin: '0 4px' }} />

          {/* Canvas mode */}
          <button
            onClick={() => { setCanvasMode(c => !c); setDrawer(null); }}
            style={{ ...NAV_BTN(canvasMode) }}
          >
            🧩 Canvas
          </button>

          <div style={{ flex: 1 }} />

          {/* Right: help */}
          <button
            onClick={() => setShowHelp(true)}
            title="Help & shortcuts (?)"
            style={{ ...ICON_BTN, fontSize: 14, color: '#475569' }}
          >
            ?
          </button>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {canvasMode ? (
            <CanvasPane />
          ) : (
            <>
              {/* Code pane — left half */}
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <CodePane />
              </div>

              {/* Divider */}
              <div style={{ width: 4, background: '#1e293b', flexShrink: 0, cursor: 'col-resize' }} />

              {/* Preview pane — right half */}
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <PreviewPane />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
