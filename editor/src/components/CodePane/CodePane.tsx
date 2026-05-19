import { useState } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import { useEditorStore } from '../../store/editorStore';
import { useConnector } from '../../hooks/useConnector';
import { useSessionStore } from '../../store/sessionStore';

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
  const { code, previousCode, isDiffMode, language, componentName, toggleDiffMode, setCode } = useEditorStore();
  const { targetProjectPath } = useSessionStore();
  const { status, message, exportComponent, injectIntoFile, reset } = useConnector();

  const [showInject, setShowInject] = useState(false);
  const [injectPath, setInjectPath] = useState('');

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

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={toggleDiffMode} style={isDiffMode ? BTN_PRIMARY : BTN}>
            {isDiffMode ? 'Diff On' : 'Diff Off'}
          </button>
          <button onClick={() => navigator.clipboard.writeText(code)} style={BTN}>
            Copy
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
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowInject(false)} style={BTN}>Cancel</button>
              <button onClick={handleInject} disabled={!injectPath.trim()} style={{ ...BTN_PRIMARY, opacity: injectPath.trim() ? 1 : 0.5 }}>
                Inject
              </button>
            </div>
          </div>
        </div>
      )}

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
            value={code}
            onChange={(val) => val !== undefined && setCode(val)}
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
