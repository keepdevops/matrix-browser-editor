import React, { useState } from 'react';
import { ChatPane } from './components/ChatPane/ChatPane';
import { PreviewPane } from './components/PreviewPane/PreviewPane';
import { CodePane } from './components/CodePane/CodePane';
import { Sidebar } from './components/Sidebar/Sidebar';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [splitPercent, setSplitPercent] = useState(50);
  const dragging = React.useRef(false);

  const onDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    const onMove = (mv: MouseEvent) => {
      if (!dragging.current) return;
      const container = document.getElementById('right-panel');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pct = Math.min(80, Math.max(20, ((mv.clientY - rect.top) / rect.height) * 100));
      setSplitPercent(pct);
    };
    const onUp = () => { dragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

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

      <div id="right-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: `${splitPercent}%`, overflow: 'hidden', borderBottom: '1px solid #1e293b' }}>
          <PreviewPane />
        </div>

        {/* Drag handle */}
        <div
          onMouseDown={onDividerMouseDown}
          style={{
            height: 5,
            background: '#1e293b',
            cursor: 'row-resize',
            flexShrink: 0,
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#4f46e5')}
          onMouseLeave={e => (e.currentTarget.style.background = '#1e293b')}
        />

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <CodePane />
        </div>
      </div>
    </div>
  );
}
