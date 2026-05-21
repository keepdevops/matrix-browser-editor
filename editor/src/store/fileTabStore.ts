import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FileTab {
  id: string;
  name: string;
  code: string;
  language: 'tsx' | 'jsx' | 'ts' | 'js';
}

interface FileTabState {
  tabs: FileTab[];
  activeTabId: string;

  openTab: (tab: Omit<FileTab, 'id'>) => string;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateActiveCode: (code: string) => void;
  renameTab: (id: string, name: string) => void;
}

const DEFAULT_TAB: FileTab = {
  id: 'default',
  name: 'MyComponent',
  code: '',
  language: 'tsx',
};

export const useFileTabStore = create<FileTabState>()(persist((set, get) => ({
  tabs: [DEFAULT_TAB],
  activeTabId: 'default',

  openTab: (tab) => {
    const id = `tab-${Date.now()}`;
    set((s) => ({ tabs: [...s.tabs, { ...tab, id }], activeTabId: id }));
    return id;
  },

  closeTab: (id) => set((s) => {
    if (s.tabs.length <= 1) return {};
    const next = s.tabs.filter((t) => t.id !== id);
    const activeTabId = id === s.activeTabId ? next[next.length - 1].id : s.activeTabId;
    return { tabs: next, activeTabId };
  }),

  setActiveTab: (id) => set({ activeTabId: id }),

  updateActiveCode: (code) => set((s) => ({
    tabs: s.tabs.map((t) => t.id === s.activeTabId ? { ...t, code } : t),
  })),

  renameTab: (id, name) => set((s) => ({
    tabs: s.tabs.map((t) => t.id === id ? { ...t, name } : t),
  })),
}), {
  name: 'file-tabs',
  partialize: (s) => ({ tabs: s.tabs, activeTabId: s.activeTabId }),
}));
