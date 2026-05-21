import { useSessionStore } from '../../store/sessionStore';
import { TemplateLibrary } from './TemplateLibrary';
import { StyleSystemPicker } from './StyleSystemPicker';
import { ConnectorPanel } from './ConnectorPanel';
import { LibraryPanel } from './LibraryPanel';

const TABS = [
  { id: 'templates' as const, label: 'Templates', icon: '⚡' },
  { id: 'style' as const, label: 'Style', icon: '🎨' },
  { id: 'connector' as const, label: 'Connector', icon: '🔌' },
  { id: 'library' as const, label: 'Library', icon: '📦' },
] as const;

export function Sidebar() {
  const { sidebarTab, setSidebarTab } = useSessionStore();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#0a0f1e',
      borderRight: '1px solid #1e293b',
    }}>
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #1e293b',
        flexShrink: 0,
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSidebarTab(tab.id)}
            style={{
              flex: 1,
              padding: '10px 4px',
              background: 'none',
              border: 'none',
              borderBottom: sidebarTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
              color: sidebarTab === tab.id ? '#a5b4fc' : '#475569',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: sidebarTab === tab.id ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {sidebarTab === 'templates' && <TemplateLibrary />}
        {sidebarTab === 'style' && <StyleSystemPicker />}
        {sidebarTab === 'connector' && <ConnectorPanel />}
        {sidebarTab === 'library' && <LibraryPanel />}
      </div>
    </div>
  );
}
