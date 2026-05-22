import { useState, useCallback } from 'react';
import type * as Monaco from 'monaco-editor';

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

interface InlineEditState {
  visible: boolean;
  top: number;
  left: number;
  selectedText: string;
  selection: Monaco.Selection | null;
}

interface PendingEdit {
  oldCode: string;
  newCode: string;
  selection: Monaco.Selection;
  replacement: string;
}

export function useInlineEdit(editorRef: React.MutableRefObject<Monaco.editor.IStandaloneCodeEditor | null>) {
  const [state, setState] = useState<InlineEditState>({ visible: false, top: 0, left: 0, selectedText: '', selection: null });
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<PendingEdit | null>(null);

  const onSelectionChange = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const sel = editor.getSelection();
    if (!sel || sel.isEmpty()) { setState(s => ({ ...s, visible: false })); return; }
    const selectedText = editor.getModel()?.getValueInRange(sel) ?? '';
    if (!selectedText.trim()) { setState(s => ({ ...s, visible: false })); return; }
    const coords = editor.getScrolledVisiblePosition({ lineNumber: sel.startLineNumber, column: sel.startColumn });
    if (!coords) return;
    const domNode = editor.getDomNode();
    const rect = domNode?.getBoundingClientRect();
    setState({ visible: true, top: (rect?.top ?? 0) + coords.top - 36, left: (rect?.left ?? 0) + coords.left, selectedText, selection: sel });
  }, [editorRef]);

  const apply = useCallback(async () => {
    if (!instruction.trim() || !state.selection) return;
    const editor = editorRef.current;
    if (!editor) return;
    setLoading(true);
    try {
      const res = await fetch(`${SERVER}/api/inline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedCode: state.selectedText, instruction: instruction.trim(), context: editor.getValue() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { replacement } = await res.json();
      const oldCode = editor.getValue();
      const model = editor.getModel()!;
      const startOffset = model.getOffsetAt({ lineNumber: state.selection!.startLineNumber, column: state.selection!.startColumn });
      const endOffset = model.getOffsetAt({ lineNumber: state.selection!.endLineNumber, column: state.selection!.endColumn });
      const newCode = oldCode.slice(0, startOffset) + replacement + oldCode.slice(endOffset);
      setPending({ oldCode, newCode, selection: state.selection!, replacement });
      setState(s => ({ ...s, visible: false }));
      setInstruction('');
    } catch (err) {
      console.error('[useInlineEdit] failed:', err);
    } finally {
      setLoading(false);
    }
  }, [instruction, state, editorRef]);

  const confirmPending = useCallback(() => {
    if (!pending) return;
    const editor = editorRef.current;
    if (!editor) return;
    editor.executeEdits('inline-edit', [{ range: pending.selection, text: pending.replacement }]);
    setPending(null);
  }, [pending, editorRef]);

  const rejectPending = useCallback(() => setPending(null), []);

  const dismiss = useCallback(() => setState(s => ({ ...s, visible: false })), []);

  return { inlineEdit: state, instruction, setInstruction, apply, dismiss, loading, onSelectionChange, pending, confirmPending, rejectPending };
}
