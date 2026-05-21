import type { ComponentDef } from '../../lib/parseComponents';

interface Props {
  components: ComponentDef[];
  active: string | null; // null = "All" view
  onChange: (name: string | null) => void;
}

const TAB_BASE: React.CSSProperties = {
  padding: '3px 10px',
  border: 'none',
  borderBottom: '2px solid transparent',
  background: 'none',
  color: '#475569',
  cursor: 'pointer',
  fontSize: 11,
  fontWeight: 400,
  whiteSpace: 'nowrap',
  transition: 'color 0.15s, border-color 0.15s',
};

export function ComponentTabs({ components, active, onChange }: Props) {
  if (components.length < 2) return null;

  const tabs = [{ name: null, label: 'All' }, ...components.map(c => ({ name: c.name, label: c.name }))];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: 2,
      padding: '0 16px',
      borderBottom: '1px solid #1e293b',
      background: '#0a0f1e',
      overflowX: 'auto',
      flexShrink: 0,
    }}>
      {tabs.map(tab => {
        const isActive = tab.name === active;
        return (
          <button
            key={tab.label}
            onClick={() => onChange(tab.name)}
            style={{
              ...TAB_BASE,
              color: isActive ? '#a5b4fc' : '#475569',
              borderBottomColor: isActive ? '#6366f1' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              padding: '5px 10px',
            }}
          >
            {tab.name === null ? tab.label : (
              <span>
                <span style={{ color: '#64748b', marginRight: 2 }}>⬡</span>
                {tab.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
