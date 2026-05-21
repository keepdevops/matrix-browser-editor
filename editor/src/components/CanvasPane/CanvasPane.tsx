import React from 'react';
import { Puck } from '@measured/puck';
import '@measured/puck/dist/index.css';
import { usePuckStore } from '../../store/puckStore';
import { useLibraryStore } from '../../store/libraryStore';
import { useEditorStore } from '../../store/editorStore';
import { useSessionStore } from '../../store/sessionStore';
import { usePuckConfig } from './usePuckConfig';
import { useCanvasExport } from './useCanvasExport';

const BTN: React.CSSProperties = {
  padding: '4px 12px', borderRadius: 6, background: '#1e293b',
  border: '1px solid #334155', color: '#94a3b8', cursor: 'pointer', fontSize: 12,
};

export function CanvasPane() {
  const { data, setData, resetData } = usePuckStore();
  const { code, componentName } = useEditorStore();
  const { setRightTab } = useSessionStore();
  const config = usePuckConfig();
  const { sendToEditor } = useCanvasExport();

  const { components: library } = useLibraryStore();
  const hasComponents = Object.keys(config.components).length > 0;
  const hasLibraryItems = library.length > 0;
  const slotCount = data.content.length;

  const handleExport = () => {
    sendToEditor(data, code, componentName);
    setRightTab('code');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px', borderBottom: '1px solid #1e293b', flexShrink: 0,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em' }}>
          🧩 CANVAS
          {slotCount > 0 && (
            <span style={{ marginLeft: 8, fontSize: 11, color: '#6366f1', fontWeight: 400 }}>
              {slotCount} component{slotCount > 1 ? 's' : ''}
            </span>
          )}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleExport}
            disabled={slotCount === 0}
            style={{ ...BTN, color: slotCount > 0 ? '#a5b4fc' : '#475569', borderColor: slotCount > 0 ? '#4f46e5' : '#1e293b', opacity: slotCount === 0 ? 0.5 : 1 }}
          >
            ↗ Export to Code
          </button>
          <button onClick={resetData} style={BTN}>Reset</button>
        </div>
      </div>

      {/* Empty state when no library components */}
      {!hasLibraryItems && !code.trim() && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#475569', padding: 32 }}>
          <span style={{ fontSize: 32 }}>🧩</span>
          <p style={{ margin: 0, fontSize: 14, textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>
            No components yet. Generate a component with AI, then click <strong style={{ color: '#94a3b8' }}>Save</strong> in the Code tab to add it to the canvas palette.
          </p>
        </div>
      )}

      {/* Puck editor */}
      {(hasLibraryItems || code.trim()) && (
        <div style={{ flex: 1, overflow: 'hidden', colorScheme: 'light' }}>
          <Puck
            config={config}
            data={data}
            onChange={setData}
            onPublish={handleExport}
          />
        </div>
      )}
    </div>
  );
}
