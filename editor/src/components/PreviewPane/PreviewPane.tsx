import React from 'react';
import { usePreview } from '../../hooks/usePreview';
import { useScreenshot } from '../../hooks/useScreenshot';
import { useSessionStore } from '../../store/sessionStore';
import { useAgentStore } from '../../store/agentStore';

const BTN: React.CSSProperties = {
  padding: '3px 10px',
  borderRadius: 6,
  background: '#1e293b',
  border: '1px solid #334155',
  color: '#94a3b8',
  cursor: 'pointer',
  fontSize: 12,
};

export function PreviewPane() {
  const { iframeRef } = usePreview();
  const { theme, setTheme, setPendingScreenshot } = useSessionStore();
  const { isStreaming } = useAgentStore();
  const { imageUrl, isCapturing, error, capture, dismiss } = useScreenshot();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: '1px solid #1e293b',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em' }}>LIVE PREVIEW</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isStreaming && (
            <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 500 }}>● rendering…</span>
          )}
          <button
            onClick={capture}
            disabled={isCapturing}
            style={{ ...BTN, color: isCapturing ? '#475569' : '#7dd3fc', borderColor: isCapturing ? '#1e293b' : '#1d4ed8' }}
          >
            {isCapturing ? '⏳ capturing…' : '📸 Screenshot'}
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={BTN}
          >
            {theme === 'dark' ? '☀ Light' : '☾ Dark'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <iframe
          ref={iframeRef}
          title="Component Preview"
          sandbox="allow-scripts"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            background: theme === 'dark' ? '#0f172a' : '#f8fafc',
          }}
        />
      </div>

      {(imageUrl || error) && (
        <div
          onClick={dismiss}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 50, cursor: 'pointer',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0f172a', border: '1px solid #334155', borderRadius: 12,
              padding: 16, maxWidth: '90vw', maxHeight: '90vh',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>SCREENSHOT</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {imageUrl && (
                  <>
                    <button
                      onClick={() => { setPendingScreenshot(imageUrl); dismiss(); }}
                      style={{ ...BTN, color: '#a5b4fc', borderColor: '#4f46e5' }}
                    >
                      ✏ Edit with AI
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(imageUrl!);
                          const blob = await res.blob();
                          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                        } catch (err) { console.error('[PreviewPane] copy failed:', err); }
                      }}
                      style={BTN}
                    >
                      📋 Copy
                    </button>
                    <a
                      href={imageUrl}
                      download="component.png"
                      style={{ ...BTN, textDecoration: 'none', color: '#7dd3fc' }}
                    >
                      ↓ Save
                    </a>
                    <button
                      onClick={() => {
                        const name = prompt('Filename:', 'component.png');
                        if (!name || !imageUrl) return;
                        const a = document.createElement('a');
                        a.href = imageUrl; a.download = name; a.click();
                      }}
                      style={BTN}
                    >
                      ↓ Save As…
                    </button>
                  </>
                )}
                <button onClick={dismiss} style={BTN}>✕ Close</button>
              </div>
            </div>
            {error && (
              <div style={{ color: '#f87171', fontSize: 13, padding: '8px 12px', background: '#1e0a0a', borderRadius: 6 }}>
                {error}
              </div>
            )}
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Component screenshot"
                style={{ borderRadius: 8, maxWidth: '80vw', maxHeight: '75vh', objectFit: 'contain' }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
