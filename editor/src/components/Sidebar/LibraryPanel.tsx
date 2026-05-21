import { useLibraryStore, type SavedComponent } from '../../store/libraryStore';
import { useEditorStore } from '../../store/editorStore';

const BTN: React.CSSProperties = {
  padding: '3px 8px',
  borderRadius: 4,
  background: '#1e293b',
  border: '1px solid #334155',
  color: '#94a3b8',
  cursor: 'pointer',
  fontSize: 11,
};

function ComponentCard({ c }: { c: SavedComponent }) {
  const { setCode, setComponentName, setLanguage } = useEditorStore();
  const { remove } = useLibraryStore();

  const load = () => {
    setCode(c.code);
    setComponentName(c.name);
    setLanguage(c.language);
  };

  return (
    <div style={{
      background: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: 8,
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#a5b4fc' }}>{c.name}</span>
        <span style={{ fontSize: 10, color: '#475569' }}>.{c.language}</span>
      </div>
      {c.description && (
        <p style={{ margin: 0, fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>
          {c.description.slice(0, 80)}{c.description.length > 80 ? '…' : ''}
        </p>
      )}
      <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
        <button onClick={load} style={{ ...BTN, color: '#a5b4fc', borderColor: '#4f46e5', flex: 1 }}>
          Load
        </button>
        <button onClick={() => remove(c.id)} style={{ ...BTN, color: '#f87171', borderColor: '#7f1d1d' }}>
          ✕
        </button>
      </div>
    </div>
  );
}

export function LibraryPanel() {
  const { components, clear } = useLibraryStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 12px', borderBottom: '1px solid #1e293b', flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>
          {components.length} saved
        </span>
        {components.length > 0 && (
          <button onClick={clear} style={{ ...BTN, fontSize: 10 }}>Clear all</button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {components.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#334155', paddingTop: 32, fontSize: 12 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📦</div>
            <p style={{ margin: 0 }}>No saved components yet.<br />Use "Save to Library" after generating.</p>
          </div>
        ) : (
          components.map((c) => <ComponentCard key={c.id} c={c} />)
        )}
      </div>
    </div>
  );
}
