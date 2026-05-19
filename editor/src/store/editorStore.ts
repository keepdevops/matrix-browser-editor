import { create } from 'zustand';

interface EditorState {
  code: string;
  previousCode: string;
  componentName: string;
  language: 'tsx' | 'jsx' | 'ts' | 'js';
  isDiffMode: boolean;
  hasUnsavedChanges: boolean;

  setCode: (code: string) => void;
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
  componentName: 'MyComponent',
  language: 'tsx',
  isDiffMode: false,
  hasUnsavedChanges: false,

  setCode: (code) => set((s) => ({
    previousCode: s.code,
    code,
    hasUnsavedChanges: true,
  })),

  setComponentName: (componentName) => set({ componentName }),

  setLanguage: (language) => set({ language }),

  toggleDiffMode: () => set((s) => ({ isDiffMode: !s.isDiffMode })),

  markSaved: () => set({ hasUnsavedChanges: false }),

  reset: () => set({
    code: DEFAULT_CODE,
    previousCode: '',
    componentName: 'MyComponent',
    language: 'tsx',
    isDiffMode: false,
    hasUnsavedChanges: false,
  }),
}));
