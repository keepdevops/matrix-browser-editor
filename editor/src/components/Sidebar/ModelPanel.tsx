import { useState, useEffect, useCallback } from 'react';
import { useSessionStore } from '../../store/sessionStore';

const SERVER = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';

interface BackendStatus {
  swarmEnabled: boolean;
  swarmUrl: string | null;
  llamaCppEnabled: boolean;
  llamaCppUrl: string | null;
  llamaCppOnline: boolean;
}

const BACKENDS = [
  { id: 'auto'     as const, label: 'Auto',     desc: 'llama.cpp → Swarm → Claude' },
  { id: 'llamacpp' as const, label: 'llama.cpp', desc: 'Local model via llama-server' },
  { id: 'swarm'    as const, label: 'Swarm',     desc: 'Multi-agent coordinator' },
  { id: 'claude'   as const, label: 'Claude',    desc: 'Anthropic claude-sonnet-4-6' },
];

const DOT: React.CSSProperties = { display: 'inline-block', width: 8, height: 8, borderRadius: '50%', marginRight: 6, flexShrink: 0 };

function StatusDot({ online }: { online: boolean | null }) {
  const color = online === null ? '#475569' : online ? '#22c55e' : '#ef4444';
  return <span style={{ ...DOT, background: color }} />;
}

export function ModelPanel() {
  const { preferredBackend, setPreferredBackend } = useSessionStore();
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(() => {
    setLoading(true);
    fetch(`${SERVER}/api/status`)
      .then(r => r.json())
      .then((d: BackendStatus) => setStatus(d))
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const isAvailable = (id: typeof BACKENDS[number]['id']) => {
    if (id === 'auto' || id === 'claude') return true;
    if (id === 'llamacpp') return status?.llamaCppEnabled ?? false;
    if (id === 'swarm') return status?.swarmEnabled ?? false;
    return false;
  };

  const label: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, display: 'block' };
  const section: React.CSSProperties = { padding: '12px 12px 8px' };
  const divider: React.CSSProperties = { borderTop: '1px solid #1e293b', margin: '4px 0' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto', background: '#0a0f1e' }}>

      <div style={section}>
        <span style={label}>AI Backend</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {BACKENDS.map(({ id, label: btnLabel, desc }) => {
            const available = isAvailable(id);
            const active = preferredBackend === id;
            return (
              <button
                key={id}
                onClick={() => available && setPreferredBackend(id)}
                title={available ? desc : `${btnLabel} not configured`}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  padding: '8px 10px', borderRadius: 6, textAlign: 'left',
                  border: active ? '1px solid #6366f1' : '1px solid #1e293b',
                  background: active ? 'rgba(99,102,241,0.12)' : '#0f172a',
                  cursor: available ? 'pointer' : 'not-allowed',
                  opacity: available ? 1 : 0.4,
                  transition: 'all 0.12s',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: active ? '#a5b4fc' : '#94a3b8' }}>{btnLabel}</span>
                <span style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={divider} />

      <div style={section}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={label}>Server Status</span>
          <button
            onClick={fetchStatus}
            title="Refresh status"
            style={{ fontSize: 11, padding: '2px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 4, color: '#64748b', cursor: 'pointer' }}
          >
            {loading ? '⏳' : '↻'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 12 }}>
            <StatusDot online={status ? status.llamaCppOnline : null} />
            <span style={{ color: '#94a3b8', flex: 1 }}>llama.cpp</span>
            <span style={{ fontSize: 10, color: '#475569' }}>
              {!status ? '—' : !status.llamaCppEnabled ? 'not configured' : status.llamaCppOnline ? 'online' : 'offline'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 12 }}>
            <StatusDot online={status ? status.swarmEnabled : null} />
            <span style={{ color: '#94a3b8', flex: 1 }}>Swarm</span>
            <span style={{ fontSize: 10, color: '#475569' }}>
              {!status ? '—' : status.swarmEnabled ? 'configured' : 'not configured'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 12 }}>
            <StatusDot online={true} />
            <span style={{ color: '#94a3b8', flex: 1 }}>Claude</span>
            <span style={{ fontSize: 10, color: '#475569' }}>api key required</span>
          </div>
        </div>
      </div>

      {status?.llamaCppUrl && (
        <>
          <div style={divider} />
          <div style={{ ...section, paddingTop: 8 }}>
            <span style={label}>llama.cpp URL</span>
            <span style={{ fontSize: 11, color: '#475569', wordBreak: 'break-all' }}>{status.llamaCppUrl}</span>
          </div>
        </>
      )}
    </div>
  );
}
