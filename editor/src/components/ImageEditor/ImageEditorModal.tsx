import React, { useRef, useCallback } from 'react';
import { useImageCrop } from '../../hooks/useImageCrop';

interface Props {
  src: string;
  onClose: () => void;
  onUseInPrompt: (dataUrl: string) => void;
}

const BTN: React.CSSProperties = {
  padding: '5px 12px', borderRadius: 6, border: '1px solid #334155',
  background: '#1e293b', color: '#94a3b8', cursor: 'pointer', fontSize: 12,
};
const BTN_PRIMARY: React.CSSProperties = { ...BTN, background: '#4f46e5', borderColor: '#6366f1', color: '#fff' };

async function copyToClipboard(dataUrl: string) {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  } catch (err) {
    console.error('[ImageEditor] copy failed:', err);
  }
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export function ImageEditorModal({ src, onClose, onUseInPrompt }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const { selection, onMouseDown, onMouseMove, onMouseUp, cropToDataUrl, fullToDataUrl, clearSelection } = useImageCrop(imgRef);

  const hasCrop = Boolean(selection && selection.w > 4 && selection.h > 4);

  const getActiveDataUrl = useCallback(() =>
    hasCrop ? cropToDataUrl() : fullToDataUrl(), [hasCrop, cropToDataUrl, fullToDataUrl]);

  const handleUse = () => {
    const url = getActiveDataUrl();
    if (url) { onUseInPrompt(url); onClose(); }
  };

  const handleCopy = async () => {
    const url = getActiveDataUrl();
    if (url) await copyToClipboard(url);
  };

  const handleSave = () => {
    const url = getActiveDataUrl();
    if (url) downloadDataUrl(url, 'image.png');
  };

  const handleSaveAs = () => {
    const name = prompt('Filename:', 'image.png');
    if (!name) return;
    const url = getActiveDataUrl();
    if (url) downloadDataUrl(url, name);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0f172a', border: '1px solid #334155', borderRadius: 12,
          padding: 16, maxWidth: '92vw', maxHeight: '92vh',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}
      >
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginRight: 4 }}>IMAGE EDITOR</span>
          <span style={{ fontSize: 11, color: '#64748b' }}>{hasCrop ? 'Box selection active — drag to reselect' : 'Drag to select a region'}</span>
          <div style={{ flex: 1 }} />
          {hasCrop && (
            <button onClick={clearSelection} style={BTN} title="Clear selection">✕ Clear crop</button>
          )}
          <button onClick={handleCopy} style={BTN} title="Copy to clipboard">📋 Copy</button>
          <button onClick={handleSave} style={BTN} title="Save PNG">↓ Save</button>
          <button onClick={handleSaveAs} style={BTN} title="Save with custom name">↓ Save As…</button>
          <button onClick={handleUse} style={BTN_PRIMARY} title="Attach to chat prompt">
            ✏ Use in Prompt{hasCrop ? ' (cropped)' : ''}
          </button>
          <button onClick={onClose} style={BTN}>✕ Close</button>
        </div>

        {/* Image canvas area */}
        <div
          style={{
            position: 'relative', overflow: 'auto', maxHeight: 'calc(92vh - 100px)',
            cursor: 'crosshair', userSelect: 'none',
            border: '1px solid #1e293b', borderRadius: 8,
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <img
            ref={imgRef}
            src={src}
            alt="Edit"
            draggable={false}
            style={{ display: 'block', maxWidth: '85vw', maxHeight: 'calc(92vh - 120px)', objectFit: 'contain' }}
          />
          {selection && selection.w > 0 && (
            <div style={{
              position: 'absolute',
              left: selection.x, top: selection.y,
              width: selection.w, height: selection.h,
              border: '2px dashed #6366f1',
              background: 'rgba(99,102,241,0.08)',
              pointerEvents: 'none',
            }} />
          )}
        </div>

        <div style={{ fontSize: 11, color: '#475569', textAlign: 'center' }}>
          Drag to select a region • Ctrl+V / drag-drop a new image to replace
        </div>
      </div>
    </div>
  );
}
