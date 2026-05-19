import { useState } from 'react';
import { ALL_TEMPLATES, CATEGORIES, searchTemplates } from '../../templates';
import { useSessionStore } from '../../store/sessionStore';
import { useEditorStore } from '../../store/editorStore';
import type { Template } from '../../lib/schemas';

const CATEGORY_ICONS: Record<string, string> = {
  dashboard: '📊', form: '📋', table: '🗂', modal: '🪟',
  card: '🃏', nav: '🧭', chart: '📈', sidebar: '⬛',
};

export function TemplateLibrary() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { setActiveTemplate, activeTemplate } = useSessionStore();
  const { setCode, setComponentName } = useEditorStore();

  const filtered = query
    ? searchTemplates(query)
    : activeCategory === 'all'
      ? ALL_TEMPLATES
      : ALL_TEMPLATES.filter((t) => t.category === activeCategory);

  const handleSelect = (t: Template) => {
    const isDeselecting = activeTemplate?.id === t.id;
    setActiveTemplate(isDeselecting ? null : t);
    if (!isDeselecting) {
      setCode(t.code);
      setComponentName(t.name.replace(/\s+/g, ''));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '10px 14px' }}>
        <input
          type="text"
          placeholder="Search templates…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #1e293b',
            background: '#0f172a',
            color: '#f1f5f9',
            fontSize: 12,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 4, padding: '0 14px 8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveCategory('all')}
          style={{
            padding: '3px 8px', borderRadius: 6, fontSize: 11, border: 'none', cursor: 'pointer',
            background: activeCategory === 'all' ? '#6366f1' : '#1e293b',
            color: activeCategory === 'all' ? '#fff' : '#64748b',
          }}
        >All</button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '3px 8px', borderRadius: 6, fontSize: 11, border: 'none', cursor: 'pointer',
              background: activeCategory === cat ? '#6366f1' : '#1e293b',
              color: activeCategory === cat ? '#fff' : '#64748b',
            }}
          >
            {CATEGORY_ICONS[cat]} {cat}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.length === 0 && (
          <p style={{ color: '#475569', fontSize: 12, textAlign: 'center', paddingTop: 24 }}>No templates found</p>
        )}
        {filtered.map((t) => {
          const isActive = activeTemplate?.id === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleSelect(t)}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: isActive ? '1px solid #6366f1' : '1px solid #1e293b',
                background: isActive ? '#6366f115' : '#0f172a',
                color: '#f1f5f9',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span>{CATEGORY_ICONS[t.category]}</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>{t.description}</p>
                </div>
              </div>
              {isActive && (
                <p style={{ fontSize: 10, color: '#6366f1', marginTop: 6, marginBottom: 0, fontWeight: 600 }}>
                  ✓ Loaded into editor & preview
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
