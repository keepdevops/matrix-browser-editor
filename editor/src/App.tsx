import { useState, useEffect } from 'react';
import { ChatPane } from './components/ChatPane/ChatPane';
import { PreviewPane } from './components/PreviewPane/PreviewPane';
import { CodePane } from './components/CodePane/CodePane';
import { Sidebar } from './components/Sidebar/Sidebar';
import { CanvasPane } from './components/CanvasPane/CanvasPane';
import { KeyboardHelpModal } from './components/shared/KeyboardHelpModal';
import { useSessionStore } from './store/sessionStore';

const TAB_BTN = (active: boolean): React.CSSProperties => ({
  padding: '6px 16px',
  background: active ? '#1e293b' : 'transparent',
  border: 'none',
  borderBottom: active ? '2px solid #6366f1' : '2px solid transparent',
  color: active ? '#f1f5f9' : '#475569',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: active ? 600 : 400,
  letterSpacing: '0.04em',
  transition: 'all 0.12s',
  whiteSpace: 'nowrap' as const,
});

const COLLAPSE_BTN: React.CSSProperties = {
  padding: '3px 8px', borderRadius: 4, background: 'transparent',
  border: '1px solid #1e293b', color: '#475569', cursor: 'pointer', fontSize: 11,
};

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { rightTab, setRightTab } = useSessionStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === '?') setShowHelp(h => !h);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const sidebarWidth = sidebarCollapsed ? 44 : 200;
  const chatWidth = chatCollapsed ? 44 : 320;

  return (
    <>
    {showHelp && <KeyboardHelpModal onClose={() => setShowHelp(false)} />}
    <div style={{
      display: 'grid',
      gridTemplateColumns: `${sidebarWidth}px ${chatWidth}px 1fr`,
      gridTemplateRows: '100vh',
      height: '100vh',
      overflow: 'hidden',
      background: '#0f172a',
      color: '#f1f5f9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      transition: 'grid-template-columns 0.15s',
    }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />

      <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRight: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: chatCollapsed ? 'center' : 'flex-end', padding: '4px 6px', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
          <button onClick={() => setChatCollapsed(c => !c)} style={COLLAPSE_BTN} title={chatCollapsed ? 'Show chat' : 'Hide chat'}>
            {chatCollapsed ? '›' : '‹ Hide'}
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: chatCollapsed ? 'none' : 'flex', flexDirection: 'column' }}>
          <ChatPane />
        </div>
      </div>

      {/* Right panel — tabbed Preview / Code */}
      <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Tab switcher strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #1e293b',
          background: '#0a0f1e',
          flexShrink: 0,
          paddingLeft: 4,
        }}>
          <button style={TAB_BTN(rightTab === 'preview')} onClick={() => setRightTab('preview')}>
            ▶ Preview
          </button>
          <button style={TAB_BTN(rightTab === 'code')} onClick={() => setRightTab('code')}>
            {'</>'} Code
          </button>
          <button style={TAB_BTN(rightTab === 'canvas')} onClick={() => setRightTab('canvas')}>
            🧩 Canvas
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => setShowHelp(true)}
            title="Help & shortcuts (?)"
            style={{ ...TAB_BTN(false), padding: '6px 12px', fontSize: 13, color: '#475569' }}
          >?</button>
        </div>

        {/* Panes — only the active one is visible; all stay mounted to preserve state */}
        <div style={{ flex: 1, overflow: 'hidden', display: rightTab === 'preview' ? 'flex' : 'none', flexDirection: 'column' }}>
          <PreviewPane />
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: rightTab === 'code' ? 'flex' : 'none', flexDirection: 'column' }}>
          <CodePane />
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: rightTab === 'canvas' ? 'flex' : 'none', flexDirection: 'column' }}>
          <CanvasPane />
        </div>
      </div>
    </div>
    </>
  );
}
