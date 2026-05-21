import { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';

const ANIMATIONS = [
  {
    name: 'Fade In',
    keyframes: `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`,
    cls: `.animate-fade-in { animation: fadeIn 0.4s ease forwards; }`,
  },
  {
    name: 'Slide Up',
    keyframes: `@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`,
    cls: `.animate-slide-up { animation: slideUp 0.4s ease forwards; }`,
  },
  {
    name: 'Slide In Right',
    keyframes: `@keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }`,
    cls: `.animate-slide-right { animation: slideInRight 0.4s ease forwards; }`,
  },
  {
    name: 'Bounce',
    keyframes: `@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }`,
    cls: `.animate-bounce { animation: bounce 0.8s ease infinite; }`,
  },
  {
    name: 'Pulse',
    keyframes: `@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }`,
    cls: `.animate-pulse { animation: pulse 1.5s ease infinite; }`,
  },
  {
    name: 'Scale In',
    keyframes: `@keyframes scaleIn { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }`,
    cls: `.animate-scale-in { animation: scaleIn 0.35s ease forwards; }`,
  },
  {
    name: 'Shake',
    keyframes: `@keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }`,
    cls: `.animate-shake { animation: shake 0.4s ease; }`,
  },
  {
    name: 'Spin',
    keyframes: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`,
    cls: `.animate-spin { animation: spin 1s linear infinite; }`,
  },
];

function buildAnimationBlock(names: string[]): string {
  const selected = ANIMATIONS.filter(a => names.includes(a.name));
  if (!selected.length) return '';
  return `/* === Animations === */\n${selected.map(a => `${a.keyframes}\n${a.cls}`).join('\n')}\n/* ================= */`;
}

const ANIM_RE = /\/\* === Animations === \*\/[\s\S]*?\/\* ================= \*\//;

function injectAnimations(code: string, block: string): string {
  if (!block) return code.replace(ANIM_RE, '').trim();
  if (ANIM_RE.test(code)) return code.replace(ANIM_RE, block);
  // Insert after :root block or at start
  const rootEnd = code.indexOf('}');
  if (rootEnd !== -1) return code.slice(0, rootEnd + 1) + '\n\n' + block + code.slice(rootEnd + 1);
  return block + '\n\n' + code;
}

const BTN: React.CSSProperties = {
  padding: '5px 10px', borderRadius: 5, background: '#1e293b',
  border: '1px solid #334155', color: '#94a3b8', cursor: 'pointer',
  fontSize: 12, textAlign: 'left', width: '100%',
};

export function AnimationPanel() {
  const { code, setCode } = useEditorStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [duration, setDuration] = useState('0.4s');
  const [easing, setEasing] = useState('ease');

  const toggle = (name: string) => {
    const next = selected.includes(name) ? selected.filter(n => n !== name) : [...selected, name];
    setSelected(next);
    const block = buildAnimationBlock(next).replace(/0\.\d+s/g, duration).replace(/ease\b/g, easing);
    setCode(injectAnimations(code, block));
  };

  const applyAll = () => {
    const all = ANIMATIONS.map(a => a.name);
    setSelected(all);
    const block = buildAnimationBlock(all).replace(/0\.\d+s/g, duration).replace(/ease\b/g, easing);
    setCode(injectAnimations(code, block));
  };

  const clearAll = () => {
    setSelected([]);
    setCode(injectAnimations(code, ''));
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Animation Editor</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={applyAll} style={{ ...BTN, width: 'auto', fontSize: 10, color: '#a5b4fc', borderColor: '#4f46e5' }}>All</button>
          <button onClick={clearAll} style={{ ...BTN, width: 'auto', fontSize: 10 }}>Clear</button>
        </div>
      </div>

      {/* Duration + Easing controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Duration</div>
          <select
            value={duration}
            onChange={e => setDuration(e.target.value)}
            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: 5, padding: '4px 6px', color: '#f1f5f9', fontSize: 11 }}
          >
            {['0.15s', '0.25s', '0.4s', '0.6s', '0.8s', '1s', '1.5s'].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Easing</div>
          <select
            value={easing}
            onChange={e => setEasing(e.target.value)}
            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: 5, padding: '4px 6px', color: '#f1f5f9', fontSize: 11 }}
          >
            {['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear', 'cubic-bezier(0.34,1.56,0.64,1)'].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Animation list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {ANIMATIONS.map(anim => {
          const active = selected.includes(anim.name);
          const className = anim.cls.match(/\.([\w-]+)\s*\{/)?.[1] || '';
          return (
            <button
              key={anim.name}
              onClick={() => toggle(anim.name)}
              style={{
                ...BTN,
                background: active ? 'rgba(99,102,241,0.15)' : '#1e293b',
                border: `1px solid ${active ? '#6366f1' : '#334155'}`,
                color: active ? '#a5b4fc' : '#94a3b8',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <span>{anim.name}</span>
              <code style={{ fontSize: 10, opacity: 0.7 }}>.{className}</code>
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div style={{ marginTop: 10, padding: '8px 10px', background: '#1e293b', borderRadius: 6, border: '1px solid #334155' }}>
          <p style={{ margin: 0, fontSize: 11, color: '#475569', lineHeight: 1.5 }}>
            {selected.length} animation{selected.length > 1 ? 's' : ''} injected as CSS classes. Add e.g. <code style={{ color: '#a5b4fc' }}>className="animate-fade-in"</code> to any element.
          </p>
        </div>
      )}
    </div>
  );
}
