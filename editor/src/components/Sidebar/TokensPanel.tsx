import { useState } from 'react';
import { useTokenStore, TOKEN_DEFAULTS, TOKEN_LIGHT, GOOGLE_FONTS, applyTokens, type TokenValues } from '../../store/tokenStore';
import { useEditorStore } from '../../store/editorStore';
import { usePalette } from '../../hooks/usePalette';
import { CSSVarEditor } from './CSSVarEditor';

const COLORS: { key: keyof TokenValues; label: string }[] = [
  { key: 'color-primary', label: 'Primary' },
  { key: 'color-secondary', label: 'Secondary' },
  { key: 'color-background', label: 'Background' },
  { key: 'color-surface', label: 'Surface' },
  { key: 'color-text', label: 'Text' },
  { key: 'color-border', label: 'Border' },
];

const SPACING_OPTIONS = ['2px', '4px', '6px', '8px', '12px'];
const RADIUS_OPTIONS = ['0px', '4px', '8px', '12px', '9999px'];
const FONT_SIZE_OPTIONS = ['13px', '14px', '16px', '18px', '20px'];
const FONT_OPTIONS = Object.keys(GOOGLE_FONTS).map(name => ({ label: name, value: `${name}, sans-serif` }));

const BTN: React.CSSProperties = {
  padding: '3px 10px', borderRadius: 5, background: '#1e293b',
  border: '1px solid #334155', color: '#94a3b8', cursor: 'pointer', fontSize: 11,
};

function OptionRow({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              padding: '3px 8px', borderRadius: 5,
              background: value === opt ? '#4f46e5' : '#1e293b',
              border: `1px solid ${value === opt ? '#6366f1' : '#334155'}`,
              color: value === opt ? '#fff' : '#94a3b8',
              cursor: 'pointer', fontSize: 11,
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TokensPanel() {
  const { tokens, setToken, resetTokens } = useTokenStore();
  const { code, setCode } = useEditorStore();
  const { loading: paletteLoading, generate: generatePalette } = usePalette();
  const [paletteDesc, setPaletteDesc] = useState('');

  const handleChange = (key: keyof TokenValues, value: string) => {
    setToken(key, value);
    if (code.trim()) setCode(applyTokens(code, { ...tokens, [key]: value }));
  };

  const applyPreset = (preset: TokenValues) => {
    resetTokens();
    // Apply all values at once by injecting the whole preset
    Object.entries(preset).forEach(([k, v]) => setToken(k as keyof TokenValues, v));
    if (code.trim()) setCode(applyTokens(code, preset));
  };

  const currentFont = tokens['font-family'].split(',')[0].trim();

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Design Tokens</span>
        <button onClick={() => applyPreset(TOKEN_DEFAULTS)} style={{ ...BTN, fontSize: 10 }}>Reset</button>
      </div>

      {/* Dark / Light presets */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        <button
          onClick={() => applyPreset(TOKEN_DEFAULTS)}
          style={{ ...BTN, flex: 1, color: '#a5b4fc', borderColor: '#4f46e5' }}
        >
          🌙 Dark
        </button>
        <button
          onClick={() => applyPreset(TOKEN_LIGHT)}
          style={{ ...BTN, flex: 1, color: '#fbbf24', borderColor: '#b45309' }}
        >
          ☀ Light
        </button>
      </div>

      {/* AI Palette Generator */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>AI Palette</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            value={paletteDesc}
            onChange={e => setPaletteDesc(e.target.value)}
            onKeyDown={async e => {
              if (e.key === 'Enter' && paletteDesc.trim()) {
                const colors = await generatePalette(paletteDesc.trim());
                if (colors) Object.entries(colors).forEach(([k, v]) => handleChange(k as keyof TokenValues, v as string));
              }
            }}
            placeholder="ocean sunset, forest night…"
            style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: 5, padding: '4px 8px', color: '#f1f5f9', fontSize: 11, outline: 'none' }}
          />
          <button
            disabled={paletteLoading || !paletteDesc.trim()}
            onClick={async () => {
              const colors = await generatePalette(paletteDesc.trim());
              if (colors) Object.entries(colors).forEach(([k, v]) => handleChange(k as keyof TokenValues, v as string));
            }}
            style={{ ...BTN, opacity: paletteLoading || !paletteDesc.trim() ? 0.5 : 1, color: '#a5b4fc' }}
          >
            {paletteLoading ? '⏳' : 'Gen'}
          </button>
        </div>
      </div>

      {/* Colors */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Colors</div>
        {COLORS.map(({ key, label }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
            <label style={{ fontSize: 12, color: '#94a3b8' }}>{label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 22, height: 22, borderRadius: 5, background: tokens[key], border: '1px solid #334155', overflow: 'hidden', position: 'relative' }}>
                <input
                  type="color"
                  value={tokens[key]}
                  onChange={e => handleChange(key, e.target.value)}
                  style={{ position: 'absolute', inset: -4, width: 'calc(100% + 8px)', height: 'calc(100% + 8px)', opacity: 0, cursor: 'pointer' }}
                />
              </div>
              <input
                type="text"
                value={tokens[key]}
                onChange={e => handleChange(key, e.target.value)}
                style={{ width: 68, background: '#1e293b', border: '1px solid #334155', borderRadius: 5, padding: '2px 6px', color: '#f1f5f9', fontSize: 11, fontFamily: 'monospace' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Typography */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Typography</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {FONT_OPTIONS.map(({ label, value }) => (
            <button
              key={label}
              onClick={() => handleChange('font-family', value)}
              style={{
                padding: '5px 10px', borderRadius: 5, textAlign: 'left',
                background: currentFont === label ? 'rgba(99,102,241,0.15)' : '#1e293b',
                border: `1px solid ${currentFont === label ? '#6366f1' : '#334155'}`,
                color: currentFont === label ? '#a5b4fc' : '#94a3b8',
                cursor: 'pointer', fontSize: 12,
                fontFamily: value,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <OptionRow label="Spacing unit" value={tokens['spacing-unit']} options={SPACING_OPTIONS} onChange={v => handleChange('spacing-unit', v)} />
      <OptionRow label="Border radius" value={tokens['border-radius']} options={RADIUS_OPTIONS} onChange={v => handleChange('border-radius', v)} />
      <OptionRow label="Font size base" value={tokens['font-size-base']} options={FONT_SIZE_OPTIONS} onChange={v => handleChange('font-size-base', v)} />

      <div style={{ marginTop: 8, padding: '8px 10px', background: '#1e293b', borderRadius: 6, border: '1px solid #334155' }}>
        <p style={{ margin: 0, fontSize: 11, color: '#475569', lineHeight: 1.5 }}>
          Changes inject <code style={{ color: '#a5b4fc' }}>:root</code> CSS variables. Use <code style={{ color: '#a5b4fc' }}>var(--color-primary)</code>, <code style={{ color: '#a5b4fc' }}>var(--font-family)</code> etc.
        </p>
      </div>

      <CSSVarEditor />
    </div>
  );
}
