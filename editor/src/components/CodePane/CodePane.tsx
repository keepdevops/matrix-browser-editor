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
import { useExportZip } from '../../hooks/useExportZip';
import { useImageUpload } from '../../hooks/useImageUpload';
import { useGist } from '../../hooks/useGist';
import { useReview } from '../../hooks/useReview';
import { useTestGen } from '../../hooks/useTestGen';
import { useDocs } from '../../hooks/useDocs';
import { useStorybookExport } from '../../hooks/useStorybookExport';
import { ComponentTabs } from './ComponentTabs';
import { FileTabs } from './FileTabs';
import { RefactorMenu } from './RefactorMenu';
import { ReviewPanel } from './ReviewPanel';
import { DocsModal } from './DocsModal';
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
  const { loading: zipLoading, exportZip } = useExportZip();
  const { loading: gistLoading, createGist } = useGist();
  const { streaming: reviewStreaming, result: reviewResult, review, clear: clearReview } = useReview();
  const { loading: testLoading, generateTests } = useTestGen();
  const { loading: docsLoading, docs, generateDocs, clear: clearDocs } = useDocs();
  const { loading: storiesLoading, exportStories } = useStorybookExport();
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [embedSnippet, setEmbedSnippet] = useState<string | null>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);

  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const { uploading, uploadAndInsert } = useImageUpload(editorRef);
  const { inlineEdit, instruction, setInstruction, apply, dismiss, loading: inlineLoading, onSelectionChange } = useInlineEdit(editorRef);

  const [showPaste, setShowPaste] = useState(false);
  const [pasteVal, setPasteVal] = useState('');
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

  const handleLoadPasted = (val: string) => {
    if (!val.trim()) return;
    const nameMatch = val.match(/export\s+(?:default\s+)?(?:function|class|const)\s+([A-Z][A-Za-z0-9_]*)/);
    const name = nameMatch?.[1] ?? 'PastedComponent';
    setCode(val.trim());
    setComponentName(name);
    setLanguage('tsx');
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
      <div style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid #1e293b', flexShrink: 0, gap: 4, overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em', flexShrink: 0, marginRight: 4 }}>
          <span style={{ color: '#6366f1' }}>{componentName}.{language}</span>
        </span>
        {status !== 'idle' && (
          <span style={{ fontSize: 11, color: statusColor, flexShrink: 0, whiteSpace: 'nowrap', marginRight: 4 }}>
            {status === 'loading' ? '⏳ ' : status === 'success' ? '✓ ' : '✗ '}{message}
          </span>
        )}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center' }}>
          <button onClick={handleNewFile} title="New blank file" style={BTN}>+ New</button>
          <button onClick={() => { setPasteVal(''); setShowPaste(true); }} title="Paste a React component" style={{ ...BTN, color: '#7dd3fc', borderColor: '#1d4ed8' }}>📋 Paste</button>
          <button onClick={undo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)" style={{ ...BTN, opacity: historyIndex <= 0 ? 0.35 : 1, padding: '3px 7px' }}>↩</button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo (Ctrl+Shift+Z)" style={{ ...BTN, opacity: historyIndex >= history.length - 1 ? 0.35 : 1, padding: '3px 7px' }}>↪</button>
          <button onClick={handleFormat} disabled={formatting || !code} title="Format with Prettier" style={{ ...BTN, opacity: formatting || !code ? 0.5 : 1 }}>{formatting ? '…' : '✦'}</button>
          <button onClick={toggleDiffMode} style={isDiffMode ? BTN_PRIMARY : BTN}>{isDiffMode ? 'Diff On' : 'Diff Off'}</button>
          <button onClick={() => navigator.clipboard.writeText(code)} style={BTN}>Copy</button>
          <button onClick={() => saveToLibrary({ name: componentName, code, language, description: lastComponent?.description || '' })} disabled={!code} style={{ ...BTN, opacity: !code ? 0.5 : 1, color: '#a5b4fc', borderColor: '#4f46e5' }}>Save</button>
          <button
            onClick={async () => { const result = await share(); if (result) { setTimeout(dismissShare, 4000); } }}
            disabled={shareLoading || !code}
            title={shareId ? `Copied! Share ID: ${shareId}` : 'Share — copies link to clipboard'}
            style={{ ...BTN, opacity: shareLoading || !code ? 0.5 : 1, color: shareId ? '#34d399' : '#94a3b8', borderColor: shareId ? '#059669' : '#334155' }}
          >
            {shareLoading ? '⏳' : shareId ? '✓ Copied' : '🔗 Share'}
          </button>
          <button onClick={handleExport} disabled={status === 'loading' || !code} style={{ ...BTN, opacity: status === 'loading' || !code ? 0.5 : 1 }}>Export</button>
          <button onClick={() => { setInjectPath(''); setShowInject(true); }} disabled={status === 'loading' || !code} style={{ ...BTN, opacity: status === 'loading' || !code ? 0.5 : 1 }}>Inject</button>
          <button onClick={exportZip} disabled={zipLoading || !code} title="Download as ZIP" style={{ ...BTN, opacity: zipLoading || !code ? 0.5 : 1 }}>{zipLoading ? '⏳' : '⬇ ZIP'}</button>
          <input ref={imageUploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadAndInsert(f); e.target.value = ''; }} />
          <button onClick={() => imageUploadRef.current?.click()} disabled={uploading} title="Upload image asset — inserts URL at cursor" style={{ ...BTN, opacity: uploading ? 0.5 : 1 }}>{uploading ? '⏳' : '📎 Img'}</button>
          <button onClick={() => createGist(componentName, code, language)} disabled={gistLoading || !code} title="Export to GitHub Gist (opens in new tab)" style={{ ...BTN, opacity: gistLoading || !code ? 0.5 : 1 }}>{gistLoading ? '⏳' : 'Gist ↗'}</button>
          <button onClick={() => review(code)} disabled={reviewStreaming || !code} title="AI code review" style={{ ...BTN, opacity: reviewStreaming || !code ? 0.5 : 1 }}>{reviewStreaming ? '⏳' : '🔍 Review'}</button>
          <button onClick={() => generateTests(code, componentName, language)} disabled={testLoading || !code} title="Generate Vitest tests" style={{ ...BTN, opacity: testLoading || !code ? 0.5 : 1 }}>{testLoading ? '⏳' : '🧪 Tests'}</button>
          <button onClick={async () => { await generateDocs(code, componentName); setShowDocsModal(true); }} disabled={docsLoading || !code} title="Generate JSDoc + README" style={{ ...BTN, opacity: docsLoading || !code ? 0.5 : 1 }}>{docsLoading ? '⏳' : '📄 Docs'}</button>
          <button onClick={() => exportStories(code, componentName)} disabled={storiesLoading || !code} title="Generate Storybook stories" style={{ ...BTN, opacity: storiesLoading || !code ? 0.5 : 1 }}>{storiesLoading ? '⏳' : '📖 Stories'}</button>
          {embedSnippet ? (
            <button onClick={() => { navigator.clipboard.writeText(embedSnippet).catch(() => {}); }} title="Click to copy embed code" style={{ ...BTN, color: '#34d399', borderColor: '#059669', fontSize: 11 }}>✓ Embed</button>
          ) : (
            <button onClick={() => { if (shareId) { const s = `<iframe src="${window.location.origin}${window.location.pathname}?share=${shareId}&embed=1" width="100%" height="500" frameborder="0"></iframe>`; setEmbedSnippet(s); navigator.clipboard.writeText(s).catch(() => {}); } }} disabled={!shareId} title="Copy embed snippet (share first)" style={{ ...BTN, opacity: !shareId ? 0.4 : 1 }}>{'</> Embed'}</button>
          )}
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

      {/* Review panel */}
      <ReviewPanel result={reviewResult} streaming={reviewStreaming} onClear={clearReview} />

      {/* Docs modal */}
      {showDocsModal && docs && (
        <DocsModal jsdoc={docs.jsdoc} readme={docs.readme} onClose={() => { setShowDocsModal(false); clearDocs(); }} />
      )}

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

      {/* Paste Component Modal */}
      {showPaste && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, padding: 24, width: 640, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }}>PASTE REACT COMPONENT</span>
              <button onClick={() => setShowPaste(false)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <textarea
              autoFocus
              value={pasteVal}
              onChange={e => setPasteVal(e.target.value)}
              placeholder="Paste your React component code here…"
              style={{ height: 320, background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#f1f5f9', fontSize: 12, padding: 12, fontFamily: 'monospace', resize: 'vertical', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowPaste(false)} style={BTN}>Cancel</button>
              <button
                onClick={() => { handleLoadPasted(pasteVal); setShowPaste(false); }}
                disabled={!pasteVal.trim()}
                style={{ ...BTN_PRIMARY, opacity: pasteVal.trim() ? 1 : 0.5 }}
              >
                Load Component
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
