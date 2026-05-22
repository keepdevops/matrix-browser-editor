import { useEffect, useRef, useState } from 'react';
import { buildSrcdoc } from '../../hooks/useBuildSrcdoc';
import type { Template } from '../../lib/schemas';

const PREVIEW_W = 320;
const PREVIEW_H = 212; // total height minus header
const SCALE = 0.5;
const IFRAME_W = PREVIEW_W / SCALE;
const IFRAME_H = PREVIEW_H / SCALE;

interface Props {
  template: Template;
  anchorRect: DOMRect;
  styleSystem: string;
  theme: string;
}

export function TemplatePreviewTooltip({ template, anchorRect, styleSystem, theme }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  const top = Math.max(8, Math.min(anchorRect.top, window.innerHeight - 260));
  const left = anchorRect.right + 8;

  useEffect(() => {
    setLoaded(false);
    const frame = iframeRef.current;
    if (!frame) return;
    frame.srcdoc = buildSrcdoc(template.code, styleSystem, theme);
  }, [template.code, styleSystem, theme]);

  return (
    <div style={{
      position: 'fixed', top, left,
      width: PREVIEW_W, height: PREVIEW_H + 28,
      zIndex: 200,
      border: '1px solid #334155', borderRadius: 10,
      overflow: 'hidden', pointerEvents: 'none',
      boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
    }}>
      {/* Label bar */}
      <div style={{
        height: 28, padding: '0 10px',
        background: '#0a0f1e', borderBottom: '1px solid #1e293b',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{template.name}</span>
        <span style={{ fontSize: 10, color: '#475569', fontStyle: 'italic' }}>{template.description}</span>
      </div>

      {/* Scaled iframe container */}
      <div style={{ width: PREVIEW_W, height: PREVIEW_H, overflow: 'hidden', position: 'relative', background: theme === 'dark' ? '#0f172a' : '#f8fafc' }}>
        {!loaded && (
          <div style={{
            position: 'absolute', inset: 0,
            background: '#1e293b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 11, color: '#475569' }}>Loading…</span>
          </div>
        )}
        <iframe
          ref={iframeRef}
          title={`Preview: ${template.name}`}
          sandbox="allow-scripts"
          onLoad={() => setLoaded(true)}
          style={{
            border: 'none',
            width: IFRAME_W,
            height: IFRAME_H,
            transform: `scale(${SCALE})`,
            transformOrigin: 'top left',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.25s',
          }}
        />
      </div>
    </div>
  );
}
