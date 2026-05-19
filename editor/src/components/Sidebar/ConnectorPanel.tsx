import { useState } from 'react';
import { useConnector } from '../../hooks/useConnector';
import { useSessionStore } from '../../store/sessionStore';

const INPUT: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: 8,
  padding: '7px 10px',
  color: '#f1f5f9',
  fontSize: 12,
  outline: 'none',
};

const BTN: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 8,
  background: '#1e293b',
  border: '1px solid #334155',
  color: '#94a3b8',
  cursor: 'pointer',
  fontSize: 12,
  width: '100%',
  textAlign: 'left',
};

const BTN_PRIMARY: React.CSSProperties = {
  ...BTN,
  background: '#6366f1',
  border: '1px solid #6366f1',
  color: '#fff',
  textAlign: 'center',
};

export function ConnectorPanel() {
  const { targetProjectPath, setTargetProjectPath } = useSessionStore();
  const { status, message, result, analyzeProject, exportComponent, injectIntoFile, reset } = useConnector();
  const [injectPath, setInjectPath] = useState('');

  const loading = status === 'loading';
  const statusColor = status === 'success' ? '#22c55e' : status === 'error' ? '#ef4444' : '#64748b';

  const handle = async (fn: () => Promise<unknown>) => {
    try { await fn(); } catch { /* error captured in connector state */ }
    setTimeout(reset, 4000);
  };

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1 }}>
      <div>
        <p style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          Project Path
        </p>
        <input
          value={targetProjectPath}
          onChange={e => setTargetProjectPath(e.target.value)}
          placeholder="/absolute/path/to/project"
          style={INPUT}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Actions
        </p>
        <button
          style={{ ...BTN, opacity: loading ? 0.5 : 1 }}
          disabled={loading}
          onClick={() => handle(() => analyzeProject(targetProjectPath))}
        >
          🔍 Analyze Project
        </button>
        <button
          style={{ ...BTN, opacity: loading || !targetProjectPath ? 0.5 : 1 }}
          disabled={loading || !targetProjectPath}
          onClick={() => handle(() => exportComponent(targetProjectPath))}
        >
          📤 Export Component
        </button>
      </div>

      <div>
        <p style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          Inject into File
        </p>
        <input
          value={injectPath}
          onChange={e => setInjectPath(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && injectPath.trim() && !loading) handle(() => injectIntoFile(injectPath.trim())); }}
          placeholder="/path/to/target/file.tsx"
          style={{ ...INPUT, marginBottom: 8 }}
        />
        <button
          style={{ ...BTN_PRIMARY, opacity: loading || !injectPath.trim() ? 0.5 : 1 }}
          disabled={loading || !injectPath.trim()}
          onClick={() => handle(() => injectIntoFile(injectPath.trim()))}
        >
          Inject
        </button>
      </div>

      {status !== 'idle' && (
        <div style={{
          background: status === 'success' ? '#052e16' : status === 'error' ? '#2d0f0f' : '#0f172a',
          border: `1px solid ${statusColor}`,
          borderRadius: 8,
          padding: '10px 12px',
        }}>
          <p style={{ fontSize: 12, color: statusColor, margin: '0 0 4px', fontWeight: 600 }}>
            {status === 'loading' ? '⏳ ' : status === 'success' ? '✓ ' : '✗ '}{message}
          </p>
          {result && (
            <pre style={{ fontSize: 11, color: '#94a3b8', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
