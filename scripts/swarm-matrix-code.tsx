export function SwarmMatrix() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('ROUTER');
  const [temp, setTemp] = useState(0.7);
  const [prompt, setPrompt] = useState('');
  const [kvCount, setKvCount] = useState(888);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Swarm Matrix online. How can I help?' },
  ]);

  const BTN: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    height: 36, minWidth: 80, padding: '0 16px',
    fontSize: 13, fontWeight: 500,
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
    background: 'rgba(255,255,255,0.05)', color: '#ffffff',
    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    gap: 6,
  };
  // primary = green (ONLINE), secondary = blue (CONFIGURE/Dashboard), warning = orange
  const BTN_BLUE: React.CSSProperties = { ...BTN, background: '#3b82f6', border: '1px solid #3b82f6' };
  const BTN_ON: React.CSSProperties   = { ...BTN, background: '#22c55e', border: '1px solid #22c55e', color: '#000', fontWeight: 600 };
  const BTN_WARN: React.CSSProperties = { ...BTN, background: '#f59e0b', border: '1px solid #f59e0b', color: '#000' };
  const BTN_SM: React.CSSProperties   = { ...BTN, height: 32, minWidth: 60, padding: '0 12px' };
  const BTN_XS: React.CSSProperties   = { ...BTN_SM, height: 24, fontSize: 10 };

  const send = () => {
    if (!prompt.trim() || loading) return;
    const userMsg = prompt;
    setMessages(m => [...m, { role: 'user', text: userMsg }]);
    setPrompt('');
    setLoading(true);
    setTimeout(() => {
      setMessages(m => [...m, { role: 'assistant', text: `Processing via ${mode} mode. Response ready.` }]);
      setLoading(false);
    }, 1200);
  };

  const bg = '#0a0f1e';
  const surface = '#0f172a';
  const border = '#1e293b';

  const agents = [
    { name: 'architect',  model: 'Codestral-22B-v0.1-Q5_K_M', on: true  },
    { name: 'database',   model: 'Select model…',               on: false },
    { name: 'debugger',   model: 'Select model…',               on: false },
    { name: 'foreman',    model: 'google_gemma-4-26B-A4B',       on: true  },
    { name: 'frontend',   model: 'Select model…',               on: false },
    { name: 'programmer', model: 'Codestral-22B-v0.1-Q5_K_M',   on: true  },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: bg, color: '#e2e8f0', fontFamily: 'monospace', fontSize: 12 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderBottom: `1px solid ${border}`, flexWrap: 'wrap', background: surface, flexShrink: 0 }}>
        <div style={{ marginRight: 6, lineHeight: 1.2 }}>
          <div style={{ fontWeight: 900, fontSize: 14, color: '#f1f5f9' }}>Swarm <span style={{ color: '#6366f1' }}>Matrix</span></div>
          <div style={{ fontSize: 9, color: '#475569' }}>v2.0.7</div>
        </div>
        <button style={BTN_ON}>ONLINE</button>
        <button style={BTN} onClick={() => setMode(m => m === 'ROUTER' ? 'DIRECT' : 'ROUTER')}>
          MODE: {mode}
        </button>
        <button style={BTN_WARN}>KV {kvCount}</button>
        <button style={BTN} onClick={() => setKvCount(0)}>CLEAR KV</button>
        <button style={BTN_BLUE}>CONFIGURE</button>
        <button style={BTN}>HISTORY (241)</button>
        <button style={BTN}>RAG</button>
        <button style={BTN}>ConvertDOCS</button>
        <button style={BTN}>CACHE ?</button>
        <button style={{ ...BTN, minWidth: 36, padding: '0' }}>?</button>
        <button style={BTN}>☀ Light</button>
        <button style={BTN_BLUE}>Dashboard</button>
      </div>

      {/* Status bar */}
      <div style={{ display: 'flex', gap: 20, padding: '3px 12px', background: bg, borderBottom: `1px solid ${border}`, fontSize: 10, color: '#475569', flexShrink: 0 }}>
        <span style={{ color: '#4ade80' }}>● ONLINE</span>
        <span>router</span>
        <span>4 agents / 8 responded</span>
        <span>0% KV usage</span>
      </div>

      {/* Main */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* Left panel */}
        <div style={{ width: 260, borderRight: `1px solid ${border}`, display: 'flex', flexDirection: 'column', background: surface, flexShrink: 0, overflow: 'hidden' }}>
          {/* Engine */}
          <div style={{ padding: '8px 10px', borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
              {['LLAMA', 'MLX', 'vLLM'].map(e => (
                <button key={e} style={{ ...BTN_XS, flex: 1, minWidth: 0, background: e === 'LLAMA' ? '#312e81' : 'rgba(255,255,255,0.05)', color: e === 'LLAMA' ? '#a5b4fc' : 'rgba(255,255,255,0.3)', borderColor: e === 'LLAMA' ? '#4f46e5' : 'rgba(255,255,255,0.1)' }}>{e}</button>
              ))}
            </div>
            <div style={{ fontSize: 10, color: '#64748b' }}>Using: LLAMA</div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
            {['CONFIGURE', 'LIVE SWAP'].map(t => (
              <button key={t} style={{ flex: 1, padding: '5px 0', fontSize: 10, fontWeight: 700, background: t === 'CONFIGURE' ? '#1e293b' : 'transparent', color: t === 'CONFIGURE' ? '#f1f5f9' : '#64748b', border: 'none', borderBottom: t === 'CONFIGURE' ? '2px solid #6366f1' : '2px solid transparent', cursor: 'pointer' }}>{t}</button>
            ))}
          </div>

          {/* Profile */}
          <div style={{ padding: '8px 10px', borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>SELECT AGENTS</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['SAFE', 'BALANCED', 'MAX', 'MIXED'].map(p => (
                <button key={p} style={{ ...BTN_XS, flex: 1, minWidth: 0, padding: '0 4px', ...(p === 'MAX' ? BTN_BLUE : {}) }}>{p}</button>
              ))}
            </div>
          </div>

          {/* Agents list */}
          <div style={{ flex: 1, overflow: 'auto', padding: '8px 10px' }}>
            {agents.map(a => (
              <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                <input type="checkbox" defaultChecked={a.on} style={{ accentColor: '#6366f1', flexShrink: 0 }} />
                <span style={{ color: a.on ? '#e2e8f0' : '#475569', width: 70, flexShrink: 0, fontSize: 11 }}>{a.name}</span>
                <span style={{ fontSize: 10, color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.model}</span>
              </div>
            ))}
          </div>

          {/* Temperature */}
          <div style={{ padding: '8px 10px', borderTop: `1px solid ${border}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: '#64748b' }}>Temperature</span>
              <span style={{ fontSize: 10, color: '#a5b4fc' }}>{temp.toFixed(1)}</span>
            </div>
            <input type="range" min="0" max="2" step="0.1" value={temp}
              onChange={e => setTemp(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#6366f1' }} />
          </div>
        </div>

        {/* Chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                <div style={{ padding: '8px 12px', borderRadius: 8, background: m.role === 'user' ? '#312e81' : '#1e293b', color: m.role === 'user' ? '#c7d2fe' : '#e2e8f0', lineHeight: 1.5 }}>
                  {m.text}
                </div>
                <div style={{ fontSize: 10, color: '#334155', marginTop: 2, textAlign: m.role === 'user' ? 'right' : 'left' }}>{m.role}</div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', padding: '8px 12px', borderRadius: 8, background: '#1e293b', color: '#6366f1' }}>
                ⏳ Thinking…
              </div>
            )}
          </div>

          {/* Prompt */}
          <div style={{ padding: '10px 12px', borderTop: `1px solid ${border}`, display: 'flex', gap: 8, background: surface, flexShrink: 0 }}>
            <div style={{ flex: 1, display: 'flex', background: bg, border: '1px solid #334155', borderRadius: 6, padding: '6px 10px' }}>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Enter prompt… (Enter to send, Shift+Enter for newline)"
                rows={2}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 12, resize: 'none', fontFamily: 'monospace' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button onClick={send} disabled={loading}
                style={{ ...BTN_BLUE, opacity: loading ? 0.6 : 1 }}>
                {loading ? '⏳' : '▶ Send'}
              </button>
              <button style={BTN_SM}>RAG ctx</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
