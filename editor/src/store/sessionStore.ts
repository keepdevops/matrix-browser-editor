import { create } from 'zustand';
import type { StyleSystem, Theme, Template } from '../lib/schemas';

interface SessionState {
  styleSystem: StyleSystem;
  theme: Theme;
  activeTemplate: Template | null;
  connectorMode: 'none' | 'export' | 'analyze' | 'inject' | 'live';
  targetProjectPath: string;
  sidebarTab: 'templates' | 'style' | 'connector';

  setStyleSystem: (s: StyleSystem) => void;
  setTheme: (t: Theme) => void;
  setActiveTemplate: (t: Template | null) => void;
  setConnectorMode: (m: SessionState['connectorMode']) => void;
  setTargetProjectPath: (p: string) => void;
  setSidebarTab: (tab: SessionState['sidebarTab']) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  styleSystem: 'tailwind',
  theme: 'dark',
  activeTemplate: null,
  connectorMode: 'none',
  targetProjectPath: '',
  sidebarTab: 'templates',

  setStyleSystem: (styleSystem) => set({ styleSystem }),
  setTheme: (theme) => set({ theme }),
  setActiveTemplate: (activeTemplate) => set({ activeTemplate }),
  setConnectorMode: (connectorMode) => set({ connectorMode }),
  setTargetProjectPath: (targetProjectPath) => set({ targetProjectPath }),
  setSidebarTab: (sidebarTab) => set({ sidebarTab }),
}));
