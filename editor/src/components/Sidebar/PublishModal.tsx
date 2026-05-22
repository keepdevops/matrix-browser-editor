import React, { useState } from 'react';
import { useNpmPublish } from '../../hooks/useNpmPublish';
import type { SavedComponent } from '../../store/libraryStore';

interface Props {
  component: SavedComponent;
  onClose: () => void;
}

const INPUT: React.CSSProperties = {
  width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: 6,
  padding: '6px 10px', color: '#f1f5f9', fontSize: 12, fontFamily: 'inherit',
  boxSizing: 'border-box', outline: 'none',
};

export function PublishModal({ component, onClose }: Props) {
  const [name, setName] = useState(component.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
  const [version, setVersion] = useState('0.1.0');
  const [description, setDescription] = useState(component.description || '');
  const { loading, result, error, publish, clear } = useNpmPublish();

  const handlePublish = () => {
    publish({ name, version, description, code: component.code, language: component.language });
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, width: 420, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.05em' }}>PUBLISH TO NPM</span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        {result ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ color: '#34d399', fontSize: 13, fontWeight: 600 }}>✓ Published successfully!</div>
            <a href={result.url} target="_blank" rel="noopener noreferrer" style={{ color: '#a5b4fc', fontSize: 12 }}>{result.url}</a>
            <button onClick={() => { clear(); onClose(); }} style={{ padding: '6px 16px', borderRadius: 6, background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Package name</label>
              <input value={name} onChange={e => setName(e.target.value)} style={INPUT} placeholder="my-component" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Version</label>
              <input value={version} onChange={e => setVersion(e.target.value)} style={INPUT} placeholder="0.1.0" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Description</label>
              <input value={description} onChange={e => setDescription(e.target.value)} style={INPUT} placeholder="A React component" />
            </div>
            {error && <div style={{ color: '#f87171', fontSize: 12, padding: '6px 10px', background: '#1e0a0a', borderRadius: 6 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{ padding: '6px 14px', borderRadius: 6, background: 'transparent', border: '1px solid #334155', color: '#64748b', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
              <button onClick={handlePublish} disabled={loading || !name} style={{ padding: '6px 16px', borderRadius: 6, background: loading ? '#334155' : '#6366f1', border: 'none', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600 }}>
                {loading ? '⏳ Publishing…' : 'Publish'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
