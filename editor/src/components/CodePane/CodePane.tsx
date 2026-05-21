import { useState, useMemo, useEffect } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import { useEditorStore } from '../../store/editorStore';
import { useConnector } from '../../hooks/useConnector';
import { useSessionStore } from '../../store/sessionStore';
import { useLibraryStore } from '../../store/libraryStore';
import { useAgentStore } from '../../store/agentStore';
import { ComponentTabs } from './ComponentTabs';
import { parseComponents, patchComponent } from '../../lib/parseComponents';

const BTN: React.CSSProperties = {
  padding: '3px 10px',
  borderRadius: 6,
  background: '#1e293b',
  border: '1px solid #334155',
  color: '#94a3b8',
  cursor: 'pointer',
  fontSize: 12,
};

const BTN_PRIMARY: React.CSSProperties = {
  ...BTN,
  background: '#6366f1',
  border: '1px solid #6366f1',
  color: '#fff',
};

export function CodePane() {
  const { code, previousCode, isDiffMode, language, componentName, historyIndex, history, toggleDiffMode, setCode, undo, redo } = useEditorStore();
  const { targetProjectPath, addRecentPath } = useSessionStore();
  const { save: saveToLibrary } = useLibraryStore();
  const { lastComponent } = useAgentStore();
  const { status, message, exportComponent, injectIntoFile, reset } = useConnector();

  const [showInject, setShowInject] = useState(false);
  const [injectPath, setInjectPath] = useState('');
  const [recentPaths] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('session-store') || '{}')?.state?.recentPaths ?? []; } catch { return []; }
  });

  // Keyboard undo/redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.key === 'z' && e.shiftKey) || e.key === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  const components = useMemo(() => parseComponents(code), [code]);

  // The component def for the active tab (null = full code view)
  const activeDef = activeComponent ? components.find(c => c.name === activeComponent) ?? null : null;
  const displayCode = activeDef ? activeDef.code : code;

  const handleEditorChange = (val: string | undefined) => {
    if (val === undefined) return;
    if (activeDef) {
      // Patch just this component's slice back into the full code
      setCode(patchComponent(code, activeDef, val));
    } else {
      setCode(val);
    }
  };

  const monacoLang = language === 'tsx' || language === 'jsx' ? 'typescript' : 'javascript';

  const handleExport = async () => {
    try {
      await exportComponent(targetProjectPath || undefined);
      setTimeout(reset, 3000);
    } catch {
      setTimeout(reset, 4000);
    }
  };

  const handleInject = async () => {
    if (!injectPath.trim()) return;
    addRecentPath(injectPath.trim());
    setShowInject(false);
    try {
      await injectIntoFile(injectPath.trim());
      setTimeout(reset, 3000);
    } catch {
      setTimeout(reset, 4000);
    }
  };

  const statusColor = status === 'success' ? '#22c55e' : status === 'error' ? '#ef4444' : '#94a3b8';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: '1px solid #1e293b',
        flexShrink: 0,
        gap: 8,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em', flexShrink: 0 }}>
          CODE — <span style={{ color: '#6366f1' }}>{componentName}.{language}</span>
        </span>

        {status !== 'idle' && (
          <span style={{ fontSize: 11, color: statusColor, flex: 1, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {status === 'loading' ? '⏳ ' : status === 'success' ? '✓ ' : '✗ '}{message}
          </span>
        )}

        <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
          <button onClick={undo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)"
            style={{ ...BTN, opacity: historyIndex <= 0 ? 0.35 : 1, padding: '3px 8px' }}>↩</button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo (Ctrl+Shift+Z)"
            style={{ ...BTN, opacity: historyIndex >= history.length - 1 ? 0.35 : 1, padding: '3px 8px' }}>↪</button>
          <button onClick={toggleDiffMode} style={isDiffMode ? BTN_PRIMARY : BTN}>
            {isDiffMode ? 'Diff On' : 'Diff Off'}
          </button>
          <button onClick={() => navigator.clipboard.writeText(code)} style={BTN}>Copy</button>
          <button
            onClick={() => saveToLibrary({ name: componentName, code, language, description: lastComponent?.description || '' })}
            disabled={!code}
            style={{ ...BTN, opacity: !code ? 0.5 : 1, color: '#a5b4fc', borderColor: '#4f46e5' }}
          >
            Save
          </button>
          <button
            onClick={handleExport}
            disabled={status === 'loading' || !code}
            style={{ ...BTN, opacity: status === 'loading' || !code ? 0.5 : 1 }}
          >
            Export
          </button>
          <button
            onClick={() => { setInjectPath(''); setShowInject(true); }}
            disabled={status === 'loading' || !code}
            style={{ ...BTN, opacity: status === 'loading' || !code ? 0.5 : 1 }}
          >
            Inject
          </button>
        </div>
      </div>

      {/* Inject modal */}
      {showInject && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
        }}>
          <div style={{ background: '#1e293b', borderRadius: 12, padding: 24, width: 400, border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 12px', color: '#f1f5f9', fontSize: 15 }}>Inject into file</h3>
            <p style={{ margin: '0 0 12px', color: '#94a3b8', fontSize: 12 }}>
              Absolute path to the target file (e.g. /my-app/src/App.tsx)
            </p>
            <input
              autoFocus
              value={injectPath}
              onChange={e => setInjectPath(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleInject(); if (e.key === 'Escape') setShowInject(false); }}
              placeholder="/path/to/target/file.tsx"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
                padding: '8px 12px', color: '#f1f5f9', fontSize: 13, outline: 'none',
              }}
            />
            {recentPaths.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <p style={{ margin: '0 0 6px', color: '#475569', fontSize: 11 }}>Recent:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {recentPaths.map((p) => (
                    <button key={p} onClick={() => setInjectPath(p)} style={{
                      ...BTN, textAlign: 'left', fontSize: 11, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%',
                    }}>{p}</button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowInject(false)} style={BTN}>Cancel</button>
              <button onClick={handleInject} disabled={!injectPath.trim()} style={{ ...BTN_PRIMARY, opacity: injectPath.trim() ? 1 : 0.5 }}>
                Inject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Component tabs */}
      <ComponentTabs components={components} active={activeComponent} onChange={setActiveComponent} />

      {/* Editor */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {isDiffMode ? (
          <DiffEditor
            height="100%"
            language={monacoLang}
            theme="vs-dark"
            original={previousCode}
            modified={code}
            options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13 }}
          />
        ) : (
          <Editor
            height="100%"
            language={monacoLang}
            theme="vs-dark"
            value={displayCode}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              formatOnPaste: true,
            }}
          />
        )}
      </div>
    </div>
  );
}
