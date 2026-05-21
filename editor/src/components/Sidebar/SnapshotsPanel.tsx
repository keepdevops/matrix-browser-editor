import { useState } from 'react';
import { useSnapshotStore } from '../../store/snapshotStore';
import { useEditorStore } from '../../store/editorStore';

function timeAgo(ms: number): string {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function SnapshotsPanel() {
  const { snapshots, save, restore, remove } = useSnapshotStore();
  const { code, componentName, language, setCode, setComponentName, setLanguage } = useEditorStore();
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    const name = nameInput.trim() || `${componentName} — ${new Date().toLocaleTimeString()}`;
    save(name, code, componentName, language);
    setNameInput('');
    setSaving(false);
  };

  const handleRestore = (id: string) => {
    const snap = restore(id);
    if (!snap) return;
    setCode(snap.code);
    setComponentName(snap.componentName);
    setLanguage(snap.language);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Save area */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
        {saving ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              autoFocus
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setSaving(false); }}
              placeholder={`${componentName} snapshot…`}
              style={{ flex: 1, background: '#1e293b', border: '1px solid #4f46e5', borderRadius: 6, padding: '4px 8px', color: '#f1f5f9', fontSize: 12, outline: 'none' }}
            />
            <button onClick={handleSave} style={{ padding: '4px 10px', borderRadius: 6, background: '#4f46e5', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12 }}>Save</button>
            <button onClick={() => setSaving(false)} style={{ padding: '4px 8px', borderRadius: 6, background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}>✕</button>
          </div>
        ) : (
          <button
            onClick={() => { setSaving(true); }}
            disabled={!code}
            style={{ width: '100%', padding: '6px', borderRadius: 7, background: 'rgba(99,102,241,0.15)', border: '1px solid #4f46e5', color: '#a5b4fc', cursor: !code ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, opacity: !code ? 0.4 : 1 }}
          >
            + Save snapshot
          </button>
        )}
      </div>

      {/* Snapshot list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {snapshots.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#475569', fontSize: 12 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📷</div>
            No snapshots yet.<br />Save named versions of your component to restore later.
          </div>
        ) : (
          snapshots.map((snap) => (
            <div key={snap.id} style={{ padding: '8px 12px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{snap.name}</div>
                <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>{snap.componentName}.{snap.language} · {timeAgo(snap.savedAt)}</div>
              </div>
              <button
                onClick={() => handleRestore(snap.id)}
                title="Restore this snapshot"
                style={{ flexShrink: 0, padding: '3px 9px', borderRadius: 5, background: 'transparent', border: '1px solid #334155', color: '#94a3b8', cursor: 'pointer', fontSize: 11 }}
              >
                Restore
              </button>
              <button
                onClick={() => remove(snap.id)}
                title="Delete snapshot"
                style={{ flexShrink: 0, background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 13, padding: '2px 4px' }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
