import type { Template } from '../../lib/schemas';

export const dashboardTemplates: Template[] = [
  {
    id: 'dash-analytics',
    name: 'Analytics Dashboard',
    category: 'dashboard',
    description: 'KPI cards, chart area, and recent activity table',
    tags: ['analytics', 'kpi', 'charts'],
    code: `export function AnalyticsDashboard() {
  const stats = [
    { label: 'Total Users', value: '24,521', change: '+12%' },
    { label: 'Revenue', value: '$89,240', change: '+8.2%' },
    { label: 'Conversion', value: '3.6%', change: '-0.4%' },
    { label: 'Avg Session', value: '4m 32s', change: '+1m' },
    {
    id: 'dash-swarm-matrix',
    name: 'Swarm Matrix',
    category: 'dashboard',
    description: 'AI chat interface with uniform header buttons, agent selector, temperature slider, and loading state',
    tags: ['ai', 'chat', 'swarm', 'dark'],
    code: `export function SwarmMatrix() {
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
    height: 28, minWidth: 80, padding: '0 10px',
    fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
    border: '1px solid #334155', borderRadius: 4,
    background: '#1e293b', color: '#94a3b8',
    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
  };
  const BTN_BLUE: React.CSSProperties  = { ...BTN, background: '#1e3a5f', border: '1px solid #3b82f6', color: '#93c5fd' };
  const BTN_ON: React.CSSProperties    = { ...BTN, background: '#052e16', border: '1px solid #22c55e', color: '#4ade80' };

  const send = () => {
    if (!prompt.trim() || loading) return;
    const userMsg = prompt;
    setMessages(m => [...m, { role: 'user', text: userMsg }]);
    setPrompt('');
    setLoading(true);
    setTimeout(() => {
      setMessages(m => [...m, { role: 'assistant', text: \`Processing via \${mode} mode. Response ready.\` }]);
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderBottom: \`1px solid \${border}\`, flexWrap: 'wrap', background: surface, flexShrink: 0 }}>
        <div style={{ marginRight: 6, lineHeight: 1.2 }}>
          <div style={{ fontWeight: 900, fontSize: 14, color: '#f1f5f9' }}>Swarm <span style={{ color: '#6366f1' }}>Matrix</span></div>
          <div style={{ fontSize: 9, color: '#475569' }}>v2.0.7</div>
        </div>
        <button style={BTN_ON}>ONLINE</button>
        <button style={BTN} onClick={() => setMode(m => m === 'ROUTER' ? 'DIRECT' : 'ROUTER')}>
          MODE: {mode}
        </button>
        <button style={{ ...BTN, color: '#fbbf24', borderColor: '#78350f' }}>KV {kvCount}</button>
        <button style={BTN} onClick={() => setKvCount(0)}>CLEAR KV</button>
        <button style={BTN_BLUE}>CONFIGURE</button>
        <button style={BTN}>HISTORY (241)</button>
        <button style={BTN}>RAG</button>
        <button style={BTN}>ConvertDOCS</button>
        <button style={{ ...BTN, color: '#a78bfa', borderColor: '#4c1d95' }}>CACHE ?</button>
        <button style={BTN}>?</button>
        <button style={{ ...BTN, background: '#1e293b', color: '#f1f5f9' }}>☀ Light</button>
        <button style={{ ...BTN, ...BTN_BLUE }}>Dashboard</button>
      </div>

      {/* Status bar */}
      <div style={{ display: 'flex', gap: 20, padding: '3px 12px', background: bg, borderBottom: \`1px solid \${border}\`, fontSize: 10, color: '#475569', flexShrink: 0 }}>
        <span style={{ color: '#4ade80' }}>● ONLINE</span>
        <span>router</span>
        <span>4 agents / 8 responded</span>
        <span>0% KV usage</span>
      </div>

      {/* Main */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* Left panel */}
        <div style={{ width: 260, borderRight: \`1px solid \${border}\`, display: 'flex', flexDirection: 'column', background: surface, flexShrink: 0, overflow: 'hidden' }}>
          {/* Engine */}
          <div style={{ padding: '8px 10px', borderBottom: \`1px solid \${border}\`, flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
              {['LLAMA', 'MLX', 'vLLM'].map(e => (
                <button key={e} style={{ ...BTN, flex: 1, minWidth: 0, height: 24, fontSize: 10, background: e === 'LLAMA' ? '#312e81' : '#1e293b', color: e === 'LLAMA' ? '#a5b4fc' : '#64748b', borderColor: e === 'LLAMA' ? '#4f46e5' : '#334155' }}>{e}</button>
              ))}
            </div>
            <div style={{ fontSize: 10, color: '#64748b' }}>Using: LLAMA</div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: \`1px solid \${border}\`, flexShrink: 0 }}>
            {['CONFIGURE', 'LIVE SWAP'].map(t => (
              <button key={t} style={{ flex: 1, padding: '5px 0', fontSize: 10, fontWeight: 700, background: t === 'CONFIGURE' ? '#1e293b' : 'transparent', color: t === 'CONFIGURE' ? '#f1f5f9' : '#64748b', border: 'none', borderBottom: t === 'CONFIGURE' ? '2px solid #6366f1' : '2px solid transparent', cursor: 'pointer' }}>{t}</button>
            ))}
          </div>

          {/* Profile */}
          <div style={{ padding: '8px 10px', borderBottom: \`1px solid \${border}\`, flexShrink: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>SELECT AGENTS</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['SAFE', 'BALANCED', 'MAX', 'MIXED'].map(p => (
                <button key={p} style={{ ...BTN, fontSize: 10, height: 22, minWidth: 0, flex: 1, padding: '0 4px', background: p === 'MAX' ? '#1e3a5f' : '#1e293b', color: p === 'MAX' ? '#93c5fd' : '#64748b', borderColor: p === 'MAX' ? '#3b82f6' : '#334155' }}>{p}</button>
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
          <div style={{ padding: '8px 10px', borderTop: \`1px solid \${border}\`, flexShrink: 0 }}>
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
          <div style={{ padding: '10px 12px', borderTop: \`1px solid \${border}\`, display: 'flex', gap: 8, background: surface, flexShrink: 0 }}>
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
                style={{ ...BTN_BLUE, height: 36, minWidth: 72, opacity: loading ? 0.6 : 1 }}>
                {loading ? '⏳' : '▶ Send'}
              </button>
              <button style={{ ...BTN, height: 28, minWidth: 72 }}>RAG ctx</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`,
  },
];
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
            <p className="text-xs mt-1 text-green-500">{s.change}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`,
  },
  {
    id: 'dash-admin',
    name: 'Admin Dashboard',
    category: 'dashboard',
    description: 'Sidebar nav, header, and content area with status widgets',
    tags: ['admin', 'sidebar', 'navigation'],
    code: `export function AdminDashboard() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md p-4 flex flex-col gap-2">
        <h2 className="font-bold text-lg mb-4">Admin</h2>
        {['Dashboard','Users','Settings','Reports'].map(item => (
          <button key={item} className="text-left px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-700 text-sm">{item}</button>
        ))}
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-xl font-bold mb-4">Dashboard Overview</h1>
        <div className="grid grid-cols-3 gap-4">
          {['Active Users','Pending Tasks','System Health'].map(w => (
            <div key={w} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow text-center">
              <p className="text-gray-500 text-sm">{w}</p>
              <p className="text-3xl font-bold mt-2">—</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}`,
  },
  {
    id: 'dash-swarm-matrix',
    name: 'Swarm Matrix',
    category: 'dashboard',
    description: 'AI chat interface with uniform header buttons, agent selector, temperature slider, and loading state',
    tags: ['ai', 'chat', 'swarm', 'dark'],
    code: `export function SwarmMatrix() {
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
    height: 28, minWidth: 80, padding: '0 10px',
    fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
    border: '1px solid #334155', borderRadius: 4,
    background: '#1e293b', color: '#94a3b8',
    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
  };
  const BTN_BLUE: React.CSSProperties  = { ...BTN, background: '#1e3a5f', border: '1px solid #3b82f6', color: '#93c5fd' };
  const BTN_ON: React.CSSProperties    = { ...BTN, background: '#052e16', border: '1px solid #22c55e', color: '#4ade80' };

  const send = () => {
    if (!prompt.trim() || loading) return;
    const userMsg = prompt;
    setMessages(m => [...m, { role: 'user', text: userMsg }]);
    setPrompt('');
    setLoading(true);
    setTimeout(() => {
      setMessages(m => [...m, { role: 'assistant', text: \`Processing via \${mode} mode. Response ready.\` }]);
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderBottom: \`1px solid \${border}\`, flexWrap: 'wrap', background: surface, flexShrink: 0 }}>
        <div style={{ marginRight: 6, lineHeight: 1.2 }}>
          <div style={{ fontWeight: 900, fontSize: 14, color: '#f1f5f9' }}>Swarm <span style={{ color: '#6366f1' }}>Matrix</span></div>
          <div style={{ fontSize: 9, color: '#475569' }}>v2.0.7</div>
        </div>
        <button style={BTN_ON}>ONLINE</button>
        <button style={BTN} onClick={() => setMode(m => m === 'ROUTER' ? 'DIRECT' : 'ROUTER')}>
          MODE: {mode}
        </button>
        <button style={{ ...BTN, color: '#fbbf24', borderColor: '#78350f' }}>KV {kvCount}</button>
        <button style={BTN} onClick={() => setKvCount(0)}>CLEAR KV</button>
        <button style={BTN_BLUE}>CONFIGURE</button>
        <button style={BTN}>HISTORY (241)</button>
        <button style={BTN}>RAG</button>
        <button style={BTN}>ConvertDOCS</button>
        <button style={{ ...BTN, color: '#a78bfa', borderColor: '#4c1d95' }}>CACHE ?</button>
        <button style={BTN}>?</button>
        <button style={{ ...BTN, background: '#1e293b', color: '#f1f5f9' }}>☀ Light</button>
        <button style={{ ...BTN, ...BTN_BLUE }}>Dashboard</button>
      </div>

      {/* Status bar */}
      <div style={{ display: 'flex', gap: 20, padding: '3px 12px', background: bg, borderBottom: \`1px solid \${border}\`, fontSize: 10, color: '#475569', flexShrink: 0 }}>
        <span style={{ color: '#4ade80' }}>● ONLINE</span>
        <span>router</span>
        <span>4 agents / 8 responded</span>
        <span>0% KV usage</span>
      </div>

      {/* Main */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* Left panel */}
        <div style={{ width: 260, borderRight: \`1px solid \${border}\`, display: 'flex', flexDirection: 'column', background: surface, flexShrink: 0, overflow: 'hidden' }}>
          {/* Engine */}
          <div style={{ padding: '8px 10px', borderBottom: \`1px solid \${border}\`, flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
              {['LLAMA', 'MLX', 'vLLM'].map(e => (
                <button key={e} style={{ ...BTN, flex: 1, minWidth: 0, height: 24, fontSize: 10, background: e === 'LLAMA' ? '#312e81' : '#1e293b', color: e === 'LLAMA' ? '#a5b4fc' : '#64748b', borderColor: e === 'LLAMA' ? '#4f46e5' : '#334155' }}>{e}</button>
              ))}
            </div>
            <div style={{ fontSize: 10, color: '#64748b' }}>Using: LLAMA</div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: \`1px solid \${border}\`, flexShrink: 0 }}>
            {['CONFIGURE', 'LIVE SWAP'].map(t => (
              <button key={t} style={{ flex: 1, padding: '5px 0', fontSize: 10, fontWeight: 700, background: t === 'CONFIGURE' ? '#1e293b' : 'transparent', color: t === 'CONFIGURE' ? '#f1f5f9' : '#64748b', border: 'none', borderBottom: t === 'CONFIGURE' ? '2px solid #6366f1' : '2px solid transparent', cursor: 'pointer' }}>{t}</button>
            ))}
          </div>

          {/* Profile */}
          <div style={{ padding: '8px 10px', borderBottom: \`1px solid \${border}\`, flexShrink: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>SELECT AGENTS</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['SAFE', 'BALANCED', 'MAX', 'MIXED'].map(p => (
                <button key={p} style={{ ...BTN, fontSize: 10, height: 22, minWidth: 0, flex: 1, padding: '0 4px', background: p === 'MAX' ? '#1e3a5f' : '#1e293b', color: p === 'MAX' ? '#93c5fd' : '#64748b', borderColor: p === 'MAX' ? '#3b82f6' : '#334155' }}>{p}</button>
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
          <div style={{ padding: '8px 10px', borderTop: \`1px solid \${border}\`, flexShrink: 0 }}>
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
          <div style={{ padding: '10px 12px', borderTop: \`1px solid \${border}\`, display: 'flex', gap: 8, background: surface, flexShrink: 0 }}>
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
                style={{ ...BTN_BLUE, height: 36, minWidth: 72, opacity: loading ? 0.6 : 1 }}>
                {loading ? '⏳' : '▶ Send'}
              </button>
              <button style={{ ...BTN, height: 28, minWidth: 72 }}>RAG ctx</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`,
  },
];
