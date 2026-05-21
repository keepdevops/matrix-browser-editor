import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StyleSystem, Theme, Template } from '../lib/schemas';

interface SessionState {
  styleSystem: StyleSystem;
  theme: Theme;
  activeTemplate: Template | null;
  connectorMode: 'none' | 'export' | 'analyze' | 'inject' | 'live';
  targetProjectPath: string;
  recentPaths: string[];
  sidebarTab: 'templates' | 'style' | 'connector' | 'library';
  pendingScreenshot: string | null;
  rightTab: 'preview' | 'code';

  setStyleSystem: (s: StyleSystem) => void;
  setTheme: (t: Theme) => void;
  setActiveTemplate: (t: Template | null) => void;
  setConnectorMode: (m: SessionState['connectorMode']) => void;
  setTargetProjectPath: (p: string) => void;
  addRecentPath: (p: string) => void;
  setSidebarTab: (tab: SessionState['sidebarTab']) => void;
  setPendingScreenshot: (url: string | null) => void;
  setRightTab: (tab: 'preview' | 'code') => void;
}

export const useSessionStore = create<SessionState>()(persist((set) => ({
  styleSystem: 'tailwind',
  theme: 'dark',
  activeTemplate: null,
  connectorMode: 'none',
  targetProjectPath: '',
  recentPaths: [],
  sidebarTab: 'templates',
  pendingScreenshot: null,
  rightTab: 'preview',

  setStyleSystem: (styleSystem) => set({ styleSystem }),
  setTheme: (theme) => set({ theme }),
  setActiveTemplate: (activeTemplate) => set({ activeTemplate }),
  setConnectorMode: (connectorMode) => set({ connectorMode }),
  setTargetProjectPath: (targetProjectPath) => set({ targetProjectPath }),
  addRecentPath: (p) => set((s) => ({
    recentPaths: [p, ...s.recentPaths.filter((x) => x !== p)].slice(0, 8),
  })),
  setSidebarTab: (sidebarTab) => set({ sidebarTab }),
  setPendingScreenshot: (pendingScreenshot) => set({ pendingScreenshot }),
  setRightTab: (rightTab) => set({ rightTab }),
}), {
  name: 'session-store',
  partialize: (s) => ({ styleSystem: s.styleSystem, theme: s.theme, recentPaths: s.recentPaths }),
}));
