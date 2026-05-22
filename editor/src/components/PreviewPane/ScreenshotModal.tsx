import React from 'react';

const BTN: React.CSSProperties = {
  padding: '3px 10px', borderRadius: 6, background: '#1e293b',
  border: '1px solid #334155', color: '#94a3b8', cursor: 'pointer', fontSize: 12,
};

interface Props {
  imageUrl: string | null;
  error: string | null;
  onDismiss: () => void;
  onEditWithAI: (url: string) => void;
}

export function ScreenshotModal({ imageUrl, error, onDismiss, onEditWithAI }: Props) {
  if (!imageUrl && !error) return null;

  return (
    <div
      onClick={onDismiss}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, cursor: 'pointer' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, padding: 16, maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>SCREENSHOT</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {imageUrl && (
              <>
                <button
                  onClick={() => { onEditWithAI(imageUrl); onDismiss(); }}
                  style={{ ...BTN, color: '#a5b4fc', borderColor: '#4f46e5' }}
                >
                  ✏ Edit with AI
                </button>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(imageUrl);
                      const blob = await res.blob();
                      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                    } catch (err) { console.error('[ScreenshotModal] copy failed:', err); }
                  }}
                  style={BTN}
                >
                  📋 Copy
                </button>
                <a href={imageUrl} download="component.png" style={{ ...BTN, textDecoration: 'none', color: '#7dd3fc' }}>
                  ↓ Save
                </a>
                <button
                  onClick={() => {
                    const name = prompt('Filename:', 'component.png');
                    if (!name) return;
                    const a = document.createElement('a');
                    a.href = imageUrl; a.download = name; a.click();
                  }}
                  style={BTN}
                >
                  ↓ Save As…
                </button>
              </>
            )}
            <button onClick={onDismiss} style={BTN}>✕ Close</button>
          </div>
        </div>
        {error && (
          <div style={{ color: '#f87171', fontSize: 13, padding: '8px 12px', background: '#1e0a0a', borderRadius: 6 }}>
            {error}
          </div>
        )}
        {imageUrl && (
          <img src={imageUrl} alt="Component screenshot" style={{ borderRadius: 8, maxWidth: '80vw', maxHeight: '75vh', objectFit: 'contain' }} />
        )}
      </div>
    </div>
  );
}
