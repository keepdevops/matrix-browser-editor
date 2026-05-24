import { useSessionStore } from '../../store/sessionStore';
import { TemplateLibrary } from './TemplateLibrary';
import { StyleSystemPicker } from './StyleSystemPicker';
import { ConnectorPanel } from './ConnectorPanel';
import { LibraryPanel } from './LibraryPanel';
import { TokensPanel } from './TokensPanel';
import { SnapshotsPanel } from './SnapshotsPanel';
import { AnimationPanel } from './AnimationPanel';
import { ModelPanel } from './ModelPanel';

const TABS = [
  { id: 'templates' as const, label: 'Templates', icon: '⚡' },
  { id: 'style' as const, label: 'Style', icon: '🎨' },
  { id: 'tokens' as const, label: 'Tokens', icon: '🎛' },
  { id: 'animation' as const, label: 'Animation', icon: '✨' },
  { id: 'snapshots' as const, label: 'Snapshots', icon: '📷' },
  { id: 'connector' as const, label: 'Connector', icon: '🔌' },
  { id: 'library' as const, label: 'Library', icon: '📦' },
  { id: 'model'   as const, label: 'Model',   icon: '🤖' },
] as const;

export function Sidebar() {
  const { sidebarTab, setSidebarTab } = useSessionStore();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#0a0f1e',
    }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSidebarTab(tab.id)}
            title={tab.label}
            style={{
              flex: 1,
              padding: '10px 2px',
              background: 'none',
              border: 'none',
              borderBottom: sidebarTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
              color: sidebarTab === tab.id ? '#a5b4fc' : '#475569',
              cursor: 'pointer',
              fontSize: 13,
              transition: 'all 0.15s',
            }}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      <div style={{ padding: '4px 8px 2px', flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {TABS.find(t => t.id === sidebarTab)?.label}
        </span>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {sidebarTab === 'templates' && <TemplateLibrary />}
        {sidebarTab === 'style' && <StyleSystemPicker />}
        {sidebarTab === 'tokens' && <TokensPanel />}
        {sidebarTab === 'animation' && <AnimationPanel />}
        {sidebarTab === 'snapshots' && <SnapshotsPanel />}
        {sidebarTab === 'connector' && <ConnectorPanel />}
        {sidebarTab === 'library' && <LibraryPanel />}
        {sidebarTab === 'model' && <ModelPanel />}
      </div>
    </div>
  );
}
