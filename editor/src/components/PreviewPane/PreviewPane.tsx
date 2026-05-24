import React from 'react';
import { usePreview, buildSrcdocForTheme } from '../../hooks/usePreview';
import { useScreenshot } from '../../hooks/useScreenshot';
import { useSessionStore } from '../../store/sessionStore';
import { useAgentStore } from '../../store/agentStore';
import { useEditorStore } from '../../store/editorStore';
import { useAudit } from '../../hooks/useAudit';
import { useInspect } from '../../hooks/useInspect';
import { useVisualEdit } from '../../hooks/useVisualEdit';
import { AuditPanel } from './AuditPanel';
import { InspectPanel } from './InspectPanel';
import { PropControlsPanel } from './PropControlsPanel';
import { ConsolePanel } from './ConsolePanel';
import { DeviceFrame } from './DeviceFrame';
import { ScreenshotModal } from './ScreenshotModal';
import { AiDiffModal } from '../shared/AiDiffModal';
import { useConsoleCapture } from '../../hooks/useConsoleCapture';
import { PreviewOverflowMenu } from './PreviewOverflowMenu';
import { Button } from '../shared/Button';

const VIEWPORTS = [
  { label: '📱', title: 'Mobile (375px)', width: 375 },
  { label: '⊞', title: 'Tablet (768px)', width: 768 },
  { label: '⊡', title: 'Desktop (full)', width: 0 },
] as const;

export function PreviewPane() {
  const [inspectMode, setInspectMode] = React.useState(false);
  const [propOverrides, setPropOverrides] = React.useState<Record<string, unknown>>({});
  const { iframeRef, splitRef } = usePreview(inspectMode, propOverrides);
  const { theme, setTheme, setPendingScreenshot, styleSystem } = useSessionStore();
  const { isStreaming } = useAgentStore();
  const { code, setCode } = useEditorStore();
  const { imageUrl, isCapturing, error: screenshotError, capture, dismiss } = useScreenshot();
  const { issues, loading: auditLoading, error: auditError, ran: auditRan, audit, clear: clearAudit } = useAudit();
  const { info: inspectInfo, dismiss: dismissInspect } = useInspect(inspectMode);
  const { loading: visualEditLoading, apply: applyVisualEdit, pending: visualPending, confirmPending: confirmVisual, rejectPending: rejectVisual } = useVisualEdit();
  const [viewportWidth, setViewportWidth] = React.useState(0);
  const [zoom, setZoom] = React.useState(100);
  const [showFrame, setShowFrame] = React.useState(false);
  const [splitView, setSplitView] = React.useState(false);
  const [previewBg, setPreviewBg] = React.useState<'dark' | 'light' | 'checker'>('dark');
  const [themeCompare, setThemeCompare] = React.useState(false);
  const [autoScore, setAutoScore] = React.useState<number | null>(null);
  const [showConsole, setShowConsole] = React.useState(false);
  const { entries: consoleLogs, clear: clearConsole } = useConsoleCapture(true);
  const autoAuditTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => { clearConsole(); }, [code, clearConsole]);

  React.useEffect(() => {
    if (!code) { setAutoScore(null); return; }
    if (autoAuditTimeout.current) clearTimeout(autoAuditTimeout.current);
    autoAuditTimeout.current = setTimeout(async () => {
      try {
        const SERVER = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';
        const res = await fetch(`${SERVER}/api/audit`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        if (!res.ok) return;
        const data = await res.json();
        const issues: Array<{ severity: string }> = data.issues ?? [];
        const penalty = issues.reduce((acc, i) => {
          if (i.severity === 'error') return acc + 20;
          if (i.severity === 'warning') return acc + 10;
          return acc + 3;
        }, 0);
        setAutoScore(Math.max(0, 100 - penalty));
      } catch { /* silent — background audit */ }
    }, 2000);
  }, [code]);

  const bgStyle: React.CSSProperties = previewBg === 'checker'
    ? { backgroundImage: 'repeating-conic-gradient(#334155 0% 25%, #1e293b 0% 50%)', backgroundSize: '16px 16px' }
    : { background: previewBg === 'light' ? '#f8fafc' : '#0f172a' };

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
          <div style={{ display: 'flex', gap: 2, background: '#1e293b', borderRadius: 6, padding: 2 }}>
            {VIEWPORTS.map(vp => (
              <Button
                key={vp.width}
                size="icon"
                title={vp.title}
                onClick={() => { setViewportWidth(vp.width); if (vp.width === 0) setShowFrame(false); }}
                variant={viewportWidth === vp.width ? 'secondary' : 'default'}
                className="text-sm border-0"
              >
                {vp.label}
              </Button>
            ))}
          </div>
          {/* Zoom controls */}
          <div style={{ display: 'flex', gap: 2, background: '#1e293b', borderRadius: 6, padding: 2 }}>
            {[75, 100, 125, 150].map(z => (
              <Button
                key={z}
                size="sm"
                title={`${z}% zoom`}
                onClick={() => setZoom(z)}
                variant={zoom === z ? 'secondary' : 'default'}
                className="border-0 min-w-0 px-2"
              >
                {z}%
              </Button>
            ))}
          </div>
          {viewportWidth > 0 && (
            <Button
              size="sm"
              onClick={() => setShowFrame(f => !f)}
              title="Toggle device frame"
              variant={showFrame ? 'secondary' : 'default'}
            >
              ⬜ Frame
            </Button>
          )}
          {autoScore !== null && (
            <span
              title="Live a11y score (auto-updates on code change)"
              style={{
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                background: autoScore >= 80 ? 'rgba(34,197,94,0.15)' : autoScore >= 50 ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)',
                color: autoScore >= 80 ? '#4ade80' : autoScore >= 50 ? '#fbbf24' : '#f87171',
                border: `1px solid ${autoScore >= 80 ? '#166534' : autoScore >= 50 ? '#92400e' : '#7f1d1d'}`,
                cursor: 'default',
              }}
            >
              a11y {autoScore}
            </span>
          )}
          <Button
            size="sm"
            variant={themeCompare ? 'secondary' : 'default'}
            onClick={() => setThemeCompare(c => !c)}
            title="Side-by-side dark/light theme comparison"
          >
            ◑ Themes
          </Button>
          <Button
            size="sm"
            variant={splitView ? 'secondary' : 'default'}
            onClick={() => setSplitView(s => !s)}
            title="Toggle mobile/desktop split view"
          >
            ⧉ Split
          </Button>
          <Button
            size="sm"
            variant={inspectMode ? 'primary' : 'default'}
            onClick={() => { setInspectMode(m => !m); dismissInspect(); }}
            title="Click-to-inspect elements"
          >
            🔎 Inspect
          </Button>
          <PreviewOverflowMenu actions={[
            {
              label: `> Console${consoleLogs.length > 0 ? ` (${consoleLogs.length})` : ''}`,
              active: showConsole,
              color: consoleLogs.some(e => e.level === 'error') ? '#f87171' : consoleLogs.some(e => e.level === 'warn') ? '#fbbf24' : '#cbd5e1',
              onClick: () => setShowConsole(s => !s),
            },
            {
              label: auditLoading ? '⏳ Auditing…' : '🔍 Audit',
              disabled: auditLoading || !code,
              color: '#86efac',
              onClick: () => audit(code),
            },
            {
              label: isCapturing ? '⏳ Capturing…' : '📸 Screenshot',
              disabled: isCapturing,
              color: '#7dd3fc',
              onClick: capture,
            },
            {
              label: theme === 'dark' ? '☀ Light mode' : '☾ Dark mode',
              onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
            },
            {
              label: `▪ Bg: ${previewBg}`,
              onClick: () => setPreviewBg(bg => bg === 'dark' ? 'light' : bg === 'light' ? 'checker' : 'dark'),
            },
          ]} />
        </div>
      </div>

      {auditRan && (
        <AuditPanel issues={issues} error={auditError} onClear={clearAudit} />
      )}

      {inspectMode && (
        <div style={{ padding: '4px 16px', background: 'rgba(16,185,129,0.08)', borderBottom: '1px solid #059669', fontSize: 11, color: '#34d399' }}>
          🔎 Inspect mode — click any element in the preview to see its styles
        </div>
      )}

      {themeCompare && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {(['dark', 'light'] as const).map(t => (
            <div key={t} style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: t === 'dark' ? '1px solid #334155' : undefined }}>
              <div style={{ padding: '2px 8px', background: '#0a0f1e', fontSize: 10, color: '#475569', fontWeight: 600, letterSpacing: '0.06em' }}>
                {t === 'dark' ? '☾ DARK' : '☀ LIGHT'}
              </div>
              <iframe
                title={`${t} theme preview`}
                sandbox="allow-scripts"
                style={{ flex: 1, width: '100%', border: 'none', background: t === 'dark' ? '#0f172a' : '#f8fafc' }}
                srcDoc={buildSrcdocForTheme(code, styleSystem, t)}
              />
            </div>
          ))}
        </div>
      )}
      {!themeCompare && <div style={{ flex: 1, position: 'relative', overflow: 'auto', display: 'flex', gap: splitView ? 1 : 0, justifyContent: splitView ? 'stretch' : 'center', background: splitView ? '#0a0f1e' : undefined }}>
        {splitView && (
          <div style={{ display: 'flex', flexDirection: 'column', width: 375, flexShrink: 0, borderRight: '1px solid #1e293b' }}>
            <div style={{ padding: '2px 8px', background: '#0a0f1e', fontSize: 10, color: '#475569', fontWeight: 600, letterSpacing: '0.06em' }}>📱 MOBILE 375px</div>
            <iframe
              ref={splitRef}
              title="Mobile Preview"
              sandbox="allow-scripts"
              style={{ flex: 1, width: '100%', border: 'none', ...bgStyle }}
            />
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, alignItems: !splitView && viewportWidth > 0 ? 'center' : undefined }}>
          {splitView && <div style={{ padding: '2px 8px', background: '#0a0f1e', fontSize: 10, color: '#475569', fontWeight: 600, letterSpacing: '0.06em' }}>🖥 DESKTOP</div>}
          {!splitView && viewportWidth > 0 && showFrame ? (
            <div style={{ overflow: 'auto', flex: 1, display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
              <DeviceFrame width={viewportWidth} zoom={zoom}>
                <iframe
                  ref={iframeRef}
                  title="Component Preview"
                  sandbox="allow-scripts"
                  style={{ width: viewportWidth, height: 667, border: 'none', display: 'block', ...bgStyle, cursor: inspectMode ? 'crosshair' : undefined }}
                />
              </DeviceFrame>
            </div>
          ) : (
            <div style={{
              flex: 1, overflow: 'auto',
              transformOrigin: 'top center',
              transform: (!splitView && zoom !== 100) ? `scale(${zoom / 100})` : undefined,
              ...((!splitView && zoom !== 100) ? { height: `${10000 / zoom}%` } : {}),
            }}>
              <iframe
                ref={iframeRef}
                title="Component Preview"
                sandbox="allow-scripts"
                style={{
                  display: 'block',
                  width: (!splitView && viewportWidth > 0) ? viewportWidth : '100%',
                  minWidth: (!splitView && viewportWidth === 0) ? 600 : undefined,
                  height: splitView ? undefined : '100%',
                  minHeight: splitView ? undefined : '100%',
                  borderLeft: (!splitView && viewportWidth > 0) ? '1px solid #334155' : 'none',
                  borderRight: (!splitView && viewportWidth > 0) ? '1px solid #334155' : 'none',
                  borderBottom: (!splitView && viewportWidth > 0) ? '1px solid #334155' : 'none',
                  borderTop: 'none',
                  ...bgStyle,
                  cursor: inspectMode ? 'crosshair' : undefined,
                }}
              />
            </div>
          )}
        </div>

        {inspectInfo && (
          <InspectPanel
            info={inspectInfo}
            onDismiss={dismissInspect}
            applying={visualEditLoading}
            onApplyEdit={async (outerHTML, instruction) => {
              await applyVisualEdit(code, outerHTML, instruction);
            }}
          />
        )}
      </div>}

      {showConsole && <ConsolePanel entries={consoleLogs} onClear={clearConsole} />}

      <PropControlsPanel onPropsChange={setPropOverrides} />

      <ScreenshotModal
        imageUrl={imageUrl}
        error={screenshotError}
        onDismiss={dismiss}
        onEditWithAI={(url) => { setPendingScreenshot(url); }}
      />

      {visualPending && (
        <AiDiffModal
          label="visual edit"
          oldCode={visualPending.oldCode}
          newCode={visualPending.newCode}
          onAccept={() => { confirmVisual(setCode); dismissInspect(); }}
          onReject={rejectVisual}
        />
      )}
    </div>
  );
}
