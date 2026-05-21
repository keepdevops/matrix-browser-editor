import { useSessionStore } from '../../store/sessionStore';
import { TemplateLibrary } from './TemplateLibrary';
import { StyleSystemPicker } from './StyleSystemPicker';
import { ConnectorPanel } from './ConnectorPanel';
import { LibraryPanel } from './LibraryPanel';
import { TokensPanel } from './TokensPanel';
import { SnapshotsPanel } from './SnapshotsPanel';

const TABS = [
  { id: 'templates' as const, label: 'Templates', icon: '⚡' },
  { id: 'style' as const, label: 'Style', icon: '🎨' },
  { id: 'tokens' as const, label: 'Tokens', icon: '🎛' },
  { id: 'snapshots' as const, label: 'Snapshots', icon: '📷' },
  { id: 'connector' as const, label: 'Connector', icon: '🔌' },
  { id: 'library' as const, label: 'Library', icon: '📦' },
] as const;

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { sidebarTab, setSidebarTab } = useSessionStore();

  if (collapsed) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        background: '#0a0f1e',
        borderRight: '1px solid #1e293b',
        paddingTop: 8,
        gap: 4,
      }}>
        <button
          onClick={onToggle}
          title="Expand sidebar"
          style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 16, padding: '6px 8px' }}
        >
          ›
        </button>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setSidebarTab(tab.id); onToggle(); }}
            title={tab.label}
            style={{
              background: sidebarTab === tab.id ? 'rgba(99,102,241,0.15)' : 'none',
              border: 'none',
              borderRadius: 6,
              color: sidebarTab === tab.id ? '#a5b4fc' : '#475569',
              cursor: 'pointer',
              fontSize: 16,
              padding: '8px',
              width: 36,
            }}
          >
            {tab.icon}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#0a0f1e',
      borderRight: '1px solid #1e293b',
    }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', flexShrink: 0, alignItems: 'center' }}>
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
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
        <button
          onClick={onToggle}
          title="Collapse sidebar"
          style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 16, padding: '0 8px', flexShrink: 0 }}
        >
          ‹
        </button>
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
        {sidebarTab === 'snapshots' && <SnapshotsPanel />}
        {sidebarTab === 'connector' && <ConnectorPanel />}
        {sidebarTab === 'library' && <LibraryPanel />}
      </div>
    </div>
  );
}
