import { create } from 'zustand';

const MAX_HISTORY = 50;

interface EditorState {
  code: string;
  previousCode: string;
  history: string[];
  historyIndex: number;
  componentName: string;
  language: 'tsx' | 'jsx' | 'ts' | 'js';
  isDiffMode: boolean;
  hasUnsavedChanges: boolean;

  setCode: (code: string) => void;
  undo: () => void;
  redo: () => void;
  setComponentName: (name: string) => void;
  setLanguage: (lang: 'tsx' | 'jsx' | 'ts' | 'js') => void;
  toggleDiffMode: () => void;
  markSaved: () => void;
  reset: () => void;
}

const DEFAULT_CODE = `import React from 'react';

export function MyComponent() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">Welcome</h1>
      <p className="mt-2 text-gray-500">Describe a component in the chat to get started.</p>
    </div>
  );
}

export default MyComponent;
`;

export const useEditorStore = create<EditorState>((set) => ({
  code: DEFAULT_CODE,
  previousCode: '',
  history: [DEFAULT_CODE],
  historyIndex: 0,
  componentName: 'MyComponent',
  language: 'tsx',
  isDiffMode: false,
  hasUnsavedChanges: false,

  setCode: (code) => set((s) => {
    const trimmed = s.history.slice(0, s.historyIndex + 1);
    const next = [...trimmed, code].slice(-MAX_HISTORY);
    return { previousCode: s.code, code, history: next, historyIndex: next.length - 1, hasUnsavedChanges: true };
  }),

  undo: () => set((s) => {
    if (s.historyIndex <= 0) return {};
    const idx = s.historyIndex - 1;
    return { code: s.history[idx], previousCode: s.code, historyIndex: idx, hasUnsavedChanges: true };
  }),

  redo: () => set((s) => {
    if (s.historyIndex >= s.history.length - 1) return {};
    const idx = s.historyIndex + 1;
    return { code: s.history[idx], previousCode: s.code, historyIndex: idx, hasUnsavedChanges: true };
  }),

  setComponentName: (componentName) => set({ componentName }),

  setLanguage: (language) => set({ language }),

  toggleDiffMode: () => set((s) => ({ isDiffMode: !s.isDiffMode })),

  markSaved: () => set({ hasUnsavedChanges: false }),

  reset: () => set({
    code: DEFAULT_CODE,
    previousCode: '',
    history: [DEFAULT_CODE],
    historyIndex: 0,
    componentName: 'MyComponent',
    language: 'tsx',
    isDiffMode: false,
    hasUnsavedChanges: false,
  }),
}));
