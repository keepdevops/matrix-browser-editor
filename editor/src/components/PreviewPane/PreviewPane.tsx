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
import { AiDiffModal } from '../shared/AiDiffModal';
import { useConsoleCapture } from '../../hooks/useConsoleCapture';

const BTN: React.CSSProperties = {
  padding: '3px 10px',
  borderRadius: 6,
  background: '#1e293b',
  border: '1px solid #334155',
  color: '#94a3b8',
  cursor: 'pointer',
  fontSize: 12,
};

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
  const [splitView, setSplitView] = React.useState(false);
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
              <button
                key={vp.width}
                title={vp.title}
                onClick={() => setViewportWidth(vp.width)}
                style={{
                  ...BTN,
                  background: viewportWidth === vp.width ? '#334155' : 'transparent',
                  border: 'none',
                  padding: '2px 8px',
                  fontSize: 13,
                }}
              >
                {vp.label}
              </button>
            ))}
          </div>
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
          <button
            onClick={() => setThemeCompare(c => !c)}
            title="Side-by-side dark/light theme comparison"
            style={{ ...BTN, color: themeCompare ? '#a5b4fc' : '#94a3b8', borderColor: themeCompare ? '#4f46e5' : '#334155', background: themeCompare ? 'rgba(99,102,241,0.15)' : '#1e293b' }}
          >
            ◑ Themes
          </button>
          <button
            onClick={() => setSplitView(s => !s)}
            title="Toggle mobile/desktop split view"
            style={{ ...BTN, color: splitView ? '#a5b4fc' : '#94a3b8', borderColor: splitView ? '#4f46e5' : '#334155', background: splitView ? 'rgba(99,102,241,0.15)' : '#1e293b' }}
          >
            ⧉ Split
          </button>
          <button
            onClick={() => { setInspectMode(m => !m); dismissInspect(); }}
            title="Click-to-inspect elements"
            style={{ ...BTN, color: inspectMode ? '#34d399' : '#94a3b8', borderColor: inspectMode ? '#059669' : '#334155', background: inspectMode ? 'rgba(16,185,129,0.12)' : '#1e293b' }}
          >
            🔎 Inspect
          </button>
          <button
            onClick={() => setShowConsole(s => !s)}
            title="Toggle console output"
            style={{ ...BTN, color: showConsole ? '#a5b4fc' : consoleLogs.some(e => e.level === 'error') ? '#f87171' : consoleLogs.some(e => e.level === 'warn') ? '#fbbf24' : '#94a3b8', borderColor: showConsole ? '#4f46e5' : consoleLogs.some(e => e.level === 'error') ? '#991b1b' : '#334155', background: showConsole ? 'rgba(99,102,241,0.1)' : '#1e293b' }}
          >
            {'>'} Console{consoleLogs.length > 0 ? ` (${consoleLogs.length})` : ''}
          </button>
          <button
            onClick={() => audit(code)}
            disabled={auditLoading || !code}
            style={{ ...BTN, color: auditLoading ? '#475569' : '#86efac', borderColor: auditLoading ? '#1e293b' : '#166534', opacity: !code ? 0.4 : 1 }}
          >
            {auditLoading ? '⏳ auditing…' : '🔍 Audit'}
          </button>
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
              style={{ flex: 1, width: '100%', border: 'none', background: theme === 'dark' ? '#0f172a' : '#f8fafc' }}
            />
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          {splitView && <div style={{ padding: '2px 8px', background: '#0a0f1e', fontSize: 10, color: '#475569', fontWeight: 600, letterSpacing: '0.06em' }}>🖥 DESKTOP</div>}
          <iframe
            ref={iframeRef}
            title="Component Preview"
            sandbox="allow-scripts"
            style={{
              flex: 1,
              width: (!splitView && viewportWidth > 0) ? viewportWidth : '100%',
              height: splitView ? undefined : '100%',
              minHeight: splitView ? undefined : '100%',
              border: (!splitView && viewportWidth > 0) ? '1px solid #334155' : 'none',
              borderTop: 'none',
              background: theme === 'dark' ? '#0f172a' : '#f8fafc',
              flexShrink: 0,
              cursor: inspectMode ? 'crosshair' : undefined,
            }}
          />
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

      {(imageUrl || screenshotError) && (
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
            {screenshotError && (
              <div style={{ color: '#f87171', fontSize: 13, padding: '8px 12px', background: '#1e0a0a', borderRadius: 6 }}>
                {screenshotError}
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
