
import Editor, { DiffEditor } from '@monaco-editor/react';
import { useEditorStore } from '../../store/editorStore';

export function CodePane() {
  const { code, previousCode, isDiffMode, language, componentName, toggleDiffMode, setCode } = useEditorStore();

  const monacoLang = language === 'tsx' || language === 'jsx' ? 'typescript' : 'javascript';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: '1px solid #1e293b',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em' }}>
          CODE — <span style={{ color: '#6366f1' }}>{componentName}.{language}</span>
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={toggleDiffMode}
            style={{
              padding: '3px 10px',
              borderRadius: 6,
              background: isDiffMode ? '#6366f1' : '#1e293b',
              border: '1px solid #334155',
              color: isDiffMode ? '#fff' : '#94a3b8',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            {isDiffMode ? 'Diff On' : 'Diff Off'}
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            style={{
              padding: '3px 10px',
              borderRadius: 6,
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Copy
          </button>
        </div>
      </div>

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
