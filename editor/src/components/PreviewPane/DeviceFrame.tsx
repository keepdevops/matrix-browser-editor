import React from 'react';

interface DeviceFrameProps {
  width: number;
  zoom: number;
  children: React.ReactNode;
}

const FRAME_STYLES: Record<number, { label: string; bezelH: number; bezelV: number; radius: number; notch: boolean }> = {
  375: { label: 'iPhone', bezelH: 14, bezelV: 48, radius: 44, notch: true },
  768: { label: 'iPad', bezelH: 20, bezelV: 32, radius: 20, notch: false },
};

export function DeviceFrame({ width, zoom, children }: DeviceFrameProps) {
  const spec = FRAME_STYLES[width];
  if (!spec) return <>{children}</>;

  const scale = zoom / 100;
  const frameW = width + spec.bezelH * 2;

  return (
    <div style={{
      transformOrigin: 'top center',
      transform: `scale(${scale})`,
      display: 'inline-block',
      flexShrink: 0,
    }}>
      <div style={{
        position: 'relative',
        width: frameW,
        background: '#1e293b',
        borderRadius: spec.radius,
        border: '2px solid #334155',
        boxShadow: '0 0 0 1px #0f172a, 0 24px 48px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.04)',
        padding: `${spec.bezelV}px ${spec.bezelH}px`,
      }}>
        {/* Top bezel details */}
        {spec.notch ? (
          <div style={{
            position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
            width: 120, height: 28, background: '#0f172a',
            borderRadius: 20, zIndex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1e293b', border: '1px solid #334155' }} />
            <div style={{ width: 48, height: 6, borderRadius: 3, background: '#1e293b', border: '1px solid #334155' }} />
          </div>
        ) : (
          <div style={{
            position: 'absolute', top: spec.bezelV / 2 - 4, left: '50%', transform: 'translateX(-50%)',
            width: 40, height: 8, borderRadius: 4, background: '#0f172a',
          }} />
        )}
        {/* Home indicator */}
        <div style={{
          position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
          width: spec.notch ? 120 : 60, height: 4, borderRadius: 2, background: '#334155',
        }} />
        {/* Screen */}
        <div style={{
          width, overflow: 'hidden',
          borderRadius: spec.notch ? 4 : 8,
          background: '#0f172a',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
