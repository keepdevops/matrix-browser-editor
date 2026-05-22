import { useState, type RefObject } from 'react';
import type * as Monaco from 'monaco-editor';

const SERVER = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3000';

export function useImageUpload(editorRef: RefObject<Monaco.editor.IStandaloneCodeEditor | null>) {
  const [uploading, setUploading] = useState(false);

  const uploadAndInsert = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await fetch(`${SERVER}/api/upload`, { method: 'POST', body: form });
      if (!res.ok) { console.error('[useImageUpload] server error:', res.status); return; }
      const { url } = await res.json();
      const fullUrl = `${SERVER}${url}`;

      const editor = editorRef.current;
      if (editor) {
        const selection = editor.getSelection();
        const snippet = `"${fullUrl}"`;
        if (selection) {
          editor.executeEdits('image-upload', [{ range: selection, text: snippet }]);
        } else {
          const model = editor.getModel();
          const pos = editor.getPosition();
          if (model && pos) {
            editor.executeEdits('image-upload', [{
              range: { startLineNumber: pos.lineNumber, startColumn: pos.column, endLineNumber: pos.lineNumber, endColumn: pos.column },
              text: snippet,
            }]);
          }
        }
        editor.focus();
      }
    } catch (err) {
      console.error('[useImageUpload] failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return { uploading, uploadAndInsert };
}
