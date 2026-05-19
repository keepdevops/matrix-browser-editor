import React from 'react';
import { ChatPane } from './components/ChatPane/ChatPane';
import { PreviewPane } from './components/PreviewPane/PreviewPane';
import { CodePane } from './components/CodePane/CodePane';
import { Sidebar } from './components/Sidebar/Sidebar';

const PANE: React.CSSProperties = {
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

export default function App() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '220px 340px 1fr 1fr',
      gridTemplateRows: '100vh',
      height: '100vh',
      overflow: 'hidden',
      background: '#0f172a',
      color: '#f1f5f9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{ ...PANE, borderRight: '1px solid #1e293b' }}>
        <Sidebar />
      </div>
      <div style={{ ...PANE, borderRight: '1px solid #1e293b' }}>
        <ChatPane />
      </div>
      <div style={{ ...PANE, borderRight: '1px solid #1e293b' }}>
        <PreviewPane />
      </div>
      <div style={PANE}>
        <CodePane />
      </div>
    </div>
  );
}
