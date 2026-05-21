import { useState, useMemo, useEffect, useRef } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { useEditorStore } from '../../store/editorStore';
import { useConnector } from '../../hooks/useConnector';
import { useSessionStore } from '../../store/sessionStore';
import { useLibraryStore } from '../../store/libraryStore';
import { useAgentStore } from '../../store/agentStore';
import { useFileTabStore } from '../../store/fileTabStore';
import { useInlineEdit } from '../../hooks/useInlineEdit';
import { useAgentStream } from '../../hooks/useAgentStream';
import { useShare } from '../../hooks/useShare';
import { ComponentTabs } from './ComponentTabs';
import { FileTabs } from './FileTabs';
import { RefactorMenu } from './RefactorMenu';
import { parseComponents, patchComponent } from '../../lib/parseComponents';

const BTN: React.CSSProperties = {
  padding: '3px 10px', borderRadius: 6, background: '#1e293b',
  border: '1px solid #334155', color: '#94a3b8', cursor: 'pointer', fontSize: 12,
};
const BTN_PRIMARY: React.CSSProperties = { ...BTN, background: '#6366f1', border: '1px solid #6366f1', color: '#fff' };

async function formatCode(code: string, lang: string): Promise<string> {
  const [prettier, babelPlugin, tsPlugin, estreePlugin] = await Promise.all([
    import('prettier/standalone'),
    import('prettier/plugins/babel'),
    import('prettier/plugins/typescript'),
    import('prettier/plugins/estree'),
  ]);
  const isTs = lang === 'tsx' || lang === 'ts';
  return prettier.format(code, {
    parser: isTs ? 'typescript' : 'babel',
    plugins: [
      babelPlugin.default ?? babelPlugin,
      tsPlugin.default ?? tsPlugin,
      estreePlugin.default ?? estreePlugin,
    ],
    semi: true, singleQuote: true, tabWidth: 2, printWidth: 100,
  });
}

export function CodePane() {
  const { code, previousCode, isDiffMode, language, componentName, historyIndex, history, toggleDiffMode, setCode, setComponentName, setLanguage, undo, redo } = useEditorStore();
  const { targetProjectPath, addRecentPath } = useSessionStore();
  const { save: saveToLibrary } = useLibraryStore();
  const { lastComponent } = useAgentStore();
  const { updateActiveCode, openTab, setActiveTab } = useFileTabStore();
  const { status, message, exportComponent, injectIntoFile, reset } = useConnector();
  const { send: sendRefactor } = useAgentStream();
  const { loading: shareLoading, shareId, share, dismiss: dismissShare } = useShare();

  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const { inlineEdit, instruction, setInstruction, apply, dismiss, loading: inlineLoading, onSelectionChange } = useInlineEdit(editorRef);

  const [showInject, setShowInject] = useState(false);
  const [injectPath, setInjectPath] = useState('');
  const [formatting, setFormatting] = useState(false);
  const recentPaths: string[] = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('session-store') || '{}')?.state?.recentPaths ?? []; } catch { return []; }
  }, []);

  // Keep active file tab in sync
  useEffect(() => { updateActiveCode(code); }, [code, updateActiveCode]);

  // Keyboard undo/redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.key === 'z' && e.shiftKey) || e.key === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const components = useMemo(() => parseComponents(code), [code]);
  const activeDef = activeComponent ? components.find(c => c.name === activeComponent) ?? null : null;
  const displayCode = activeDef ? activeDef.code : code;

  const handleEditorChange = (val: string | undefined) => {
    if (val === undefined) return;
    setCode(activeDef ? patchComponent(code, activeDef, val) : val);
  };

  const monacoLang = language === 'tsx' || language === 'jsx' ? 'typescript' : 'javascript';

  const handleFormat = async () => {
    setFormatting(true);
    try { setCode(await formatCode(code, language)); } catch (e) { console.error('[format]', e); }
    finally { setFormatting(false); }
  };

  const handleExport = async () => {
    try { await exportComponent(targetProjectPath || undefined); setTimeout(reset, 3000); }
    catch { setTimeout(reset, 4000); }
  };

  const handleInject = async () => {
    if (!injectPath.trim()) return;
    addRecentPath(injectPath.trim());
    setShowInject(false);
    try { await injectIntoFile(injectPath.trim()); setTimeout(reset, 3000); }
    catch { setTimeout(reset, 4000); }
  };

  const handleNewFile = () => {
    const id = openTab({ name: 'Untitled', code: '', language: 'tsx' });
    setActiveTab(id);
    setCode('');
    setComponentName('Untitled');
    setLanguage('tsx');
  };

  const statusColor = status === 'success' ? '#22c55e' : status === 'error' ? '#ef4444' : '#94a3b8';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid #1e293b', flexShrink: 0, gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em', flexShrink: 0 }}>
          CODE — <span style={{ color: '#6366f1' }}>{componentName}.{language}</span>
        </span>
        {status !== 'idle' && (
          <span style={{ fontSize: 11, color: statusColor, flex: 1, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {status === 'loading' ? '⏳ ' : status === 'success' ? '✓ ' : '✗ '}{message}
          </span>
        )}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center' }}>
          <button onClick={handleNewFile} title="New blank file" style={BTN}>+ New</button>
          <button onClick={undo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)" style={{ ...BTN, opacity: historyIndex <= 0 ? 0.35 : 1, padding: '3px 7px' }}>↩</button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo (Ctrl+Shift+Z)" style={{ ...BTN, opacity: historyIndex >= history.length - 1 ? 0.35 : 1, padding: '3px 7px' }}>↪</button>
          <button onClick={handleFormat} disabled={formatting || !code} title="Format with Prettier" style={{ ...BTN, opacity: formatting || !code ? 0.5 : 1 }}>{formatting ? '…' : '✦'}</button>
          <button onClick={toggleDiffMode} style={isDiffMode ? BTN_PRIMARY : BTN}>{isDiffMode ? 'Diff On' : 'Diff Off'}</button>
          <button onClick={() => navigator.clipboard.writeText(code)} style={BTN}>Copy</button>
          <button onClick={() => saveToLibrary({ name: componentName, code, language, description: lastComponent?.description || '' })} disabled={!code} style={{ ...BTN, opacity: !code ? 0.5 : 1, color: '#a5b4fc', borderColor: '#4f46e5' }}>Save</button>
          <button
            onClick={async () => { const url = await share(); if (url) setTimeout(dismissShare, 4000); }}
            disabled={shareLoading || !code}
            title={shareId ? `Copied! Share ID: ${shareId}` : 'Share — copies link to clipboard'}
            style={{ ...BTN, opacity: shareLoading || !code ? 0.5 : 1, color: shareId ? '#34d399' : '#94a3b8', borderColor: shareId ? '#059669' : '#334155' }}
          >
            {shareLoading ? '⏳' : shareId ? '✓ Copied' : '🔗 Share'}
          </button>
          <button onClick={handleExport} disabled={status === 'loading' || !code} style={{ ...BTN, opacity: status === 'loading' || !code ? 0.5 : 1 }}>Export</button>
          <button onClick={() => { setInjectPath(''); setShowInject(true); }} disabled={status === 'loading' || !code} style={{ ...BTN, opacity: status === 'loading' || !code ? 0.5 : 1 }}>Inject</button>
          <RefactorMenu
            disabled={!code}
            onSelect={(prompt) => sendRefactor({ prompt, templateCode: code })}
          />
        </div>
      </div>

      {/* File tabs */}
      <FileTabs />

      {/* Component tabs */}
      <ComponentTabs components={components} active={activeComponent} onChange={setActiveComponent} />

      {/* Editor */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {isDiffMode ? (
          <DiffEditor height="100%" language={monacoLang} theme="vs-dark" original={previousCode} modified={code}
            options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13 }} />
        ) : (
          <Editor height="100%" language={monacoLang} theme="vs-dark" value={displayCode}
            onChange={handleEditorChange}
            onMount={(editor) => {
              editorRef.current = editor;
              editor.onDidChangeCursorSelection(onSelectionChange);
            }}
            options={{ minimap: { enabled: false }, fontSize: 13, lineNumbers: 'on', wordWrap: 'on', scrollBeyondLastLine: false, formatOnPaste: true }}
          />
        )}

        {/* Inline edit toolbar */}
        {inlineEdit.visible && (
          <div style={{ position: 'fixed', top: inlineEdit.top, left: inlineEdit.left, zIndex: 100, display: 'flex', gap: 4, alignItems: 'center', background: '#1e293b', border: '1px solid #4f46e5', borderRadius: 8, padding: '4px 8px', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
            <span style={{ fontSize: 10, color: '#6366f1' }}>✦ AI</span>
            <input autoFocus value={instruction} onChange={e => setInstruction(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') apply(); if (e.key === 'Escape') dismiss(); }}
              placeholder="Edit instruction…"
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f1f5f9', fontSize: 12, width: 180 }} />
            <button onClick={apply} disabled={inlineLoading || !instruction.trim()} style={{ ...BTN_PRIMARY, padding: '2px 8px', fontSize: 11, opacity: inlineLoading || !instruction.trim() ? 0.5 : 1 }}>
              {inlineLoading ? '…' : '↵'}
            </button>
            <button onClick={dismiss} style={{ ...BTN, padding: '2px 6px', fontSize: 11 }}>✕</button>
          </div>
        )}
      </div>

      {/* Inject modal */}
      {showInject && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#1e293b', borderRadius: 12, padding: 24, width: 400, border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 12px', color: '#f1f5f9', fontSize: 15 }}>Inject into file</h3>
            <input autoFocus value={injectPath} onChange={e => setInjectPath(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleInject(); if (e.key === 'Escape') setShowInject(false); }}
              placeholder="/path/to/target/file.tsx"
              style={{ width: '100%', boxSizing: 'border-box', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#f1f5f9', fontSize: 13, outline: 'none' }} />
            {recentPaths.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <p style={{ margin: '0 0 6px', color: '#475569', fontSize: 11 }}>Recent:</p>
                {recentPaths.map(p => <button key={p} onClick={() => setInjectPath(p)} style={{ ...BTN, display: 'block', textAlign: 'left', fontSize: 11, width: '100%', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p}</button>)}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowInject(false)} style={BTN}>Cancel</button>
              <button onClick={handleInject} disabled={!injectPath.trim()} style={{ ...BTN_PRIMARY, opacity: injectPath.trim() ? 1 : 0.5 }}>Inject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
