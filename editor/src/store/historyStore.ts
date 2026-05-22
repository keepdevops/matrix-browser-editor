import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type VersionSource = 'ai' | 'save' | 'manual';

export interface VersionEntry {
  id: string;
  code: string;
  componentName: string;
  language: string;
  timestamp: number;
  source: VersionSource;
  label?: string;
}

interface HistoryState {
  entries: VersionEntry[];
  push: (entry: Omit<VersionEntry, 'id'>) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const MAX_ENTRIES = 50;

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],

      push: (entry) => set((s) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const entries = [{ ...entry, id }, ...s.entries].slice(0, MAX_ENTRIES);
        return { entries };
      }),

      remove: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

      clear: () => set({ entries: [] }),
    }),
    { name: 'version-history' }
  )
);
