import { useState } from 'react';
import { ChatPane } from './components/ChatPane/ChatPane';
import { PreviewPane } from './components/PreviewPane/PreviewPane';
import { CodePane } from './components/CodePane/CodePane';
import { Sidebar } from './components/Sidebar/Sidebar';
import { CanvasPane } from './components/CanvasPane/CanvasPane';
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

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { rightTab, setRightTab } = useSessionStore();

  const sidebarWidth = sidebarCollapsed ? 44 : 200;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `${sidebarWidth}px 320px 1fr`,
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
        <ChatPane />
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
  );
}
