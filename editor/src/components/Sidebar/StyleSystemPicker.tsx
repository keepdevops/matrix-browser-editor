
import { useSessionStore } from '../../store/sessionStore';
import { STYLE_SYSTEMS } from '../../lib/schemas';
import type { StyleSystem } from '../../lib/schemas';

export function StyleSystemPicker() {
  const { styleSystem, setStyleSystem, theme, setTheme } = useSessionStore();

  return (
    <div style={{ padding: '12px 14px' }}>
      <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 8, letterSpacing: '0.08em' }}>STYLE SYSTEM</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {STYLE_SYSTEMS.map((sys) => {
          const active = styleSystem === sys.id;
          return (
            <button
              key={sys.id}
              onClick={() => setStyleSystem(sys.id as StyleSystem)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 10px',
                borderRadius: 8,
                border: active ? `1px solid ${sys.color}40` : '1px solid transparent',
                background: active ? `${sys.color}15` : 'transparent',
                color: active ? '#f1f5f9' : '#64748b',
                cursor: 'pointer',
                fontSize: 13,
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: sys.color, flexShrink: 0 }} />
              {sys.label}
              {active && <span style={{ marginLeft: 'auto', fontSize: 10, color: sys.color }}>active</span>}
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 16, marginBottom: 8, letterSpacing: '0.08em' }}>THEME</p>
      <div style={{ display: 'flex', gap: 6 }}>
        {(['light', 'dark'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            style={{
              flex: 1,
              padding: '6px',
              borderRadius: 8,
              border: theme === t ? '1px solid #6366f1' : '1px solid #1e293b',
              background: theme === t ? '#6366f120' : 'transparent',
              color: theme === t ? '#a5b4fc' : '#475569',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: theme === t ? 600 : 400,
            }}
          >
            {t === 'light' ? '☀ Light' : '☾ Dark'}
          </button>
        ))}
      </div>
    </div>
  );
}
