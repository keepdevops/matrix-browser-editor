import { useState } from 'react';
import { useFileTabStore, type FileTab } from '../../store/fileTabStore';
import { useEditorStore } from '../../store/editorStore';

const EXT_COLOR: Record<string, string> = { tsx: '#7dd3fc', jsx: '#86efac', ts: '#c4b5fd', js: '#fde68a' };

function Tab({ tab, isActive }: { tab: FileTab; isActive: boolean }) {
  const { setActiveTab, closeTab, renameTab, tabs } = useFileTabStore();
  const { setCode, setComponentName, setLanguage } = useEditorStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tab.name);

  const activate = () => {
    setActiveTab(tab.id);
    setCode(tab.code);
    setComponentName(tab.name);
    setLanguage(tab.language);
  };

  const commitRename = () => {
    if (draft.trim()) { renameTab(tab.id, draft.trim()); setComponentName(draft.trim()); }
    setEditing(false);
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
      borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
      background: isActive ? '#0f172a' : 'transparent',
      cursor: 'pointer', flexShrink: 0,
    }} onClick={activate}>
      {editing ? (
        <input
          autoFocus value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditing(false); }}
          onClick={e => e.stopPropagation()}
          style={{ background: '#1e293b', border: '1px solid #6366f1', borderRadius: 4, color: '#f1f5f9', fontSize: 11, padding: '1px 4px', width: 90, outline: 'none' }}
        />
      ) : (
        <span
          onDoubleClick={e => { e.stopPropagation(); setDraft(tab.name); setEditing(true); }}
          style={{ fontSize: 11, color: isActive ? '#f1f5f9' : '#64748b', whiteSpace: 'nowrap' }}
        >
          {tab.name}
          <span style={{ color: EXT_COLOR[tab.language] ?? '#94a3b8', marginLeft: 2, fontSize: 10 }}>.{tab.language}</span>
        </span>
      )}
      {tabs.length > 1 && (
        <span onClick={e => { e.stopPropagation(); closeTab(tab.id); }} style={{ color: '#475569', fontSize: 10, marginLeft: 2, cursor: 'pointer', lineHeight: 1 }}>×</span>
      )}
    </div>
  );
}

export function FileTabs() {
  const { tabs, activeTabId, openTab, setActiveTab } = useFileTabStore();
  const { code, setCode, setComponentName, setLanguage } = useEditorStore();

  const handleNew = () => {
    const id = openTab({ name: 'Untitled', code: '', language: 'tsx' });
    setCode('');
    setComponentName('Untitled');
    setLanguage('tsx');
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', borderBottom: '1px solid #1e293b',
      background: '#0a0f1e', overflowX: 'auto', flexShrink: 0, minHeight: 30,
    }}>
      {tabs.map(tab => <Tab key={tab.id} tab={tab} isActive={tab.id === activeTabId} />)}
      <button onClick={handleNew} title="New file" style={{
        padding: '4px 10px', background: 'none', border: 'none', color: '#334155',
        cursor: 'pointer', fontSize: 14, flexShrink: 0, lineHeight: 1,
      }}>+</button>
    </div>
  );
}
