import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Snapshot {
  id: string;
  name: string;
  code: string;
  componentName: string;
  language: 'tsx' | 'jsx' | 'ts' | 'js';
  savedAt: number;
}

interface SnapshotStore {
  snapshots: Snapshot[];
  save: (name: string, code: string, componentName: string, language: Snapshot['language']) => void;
  restore: (id: string) => Snapshot | undefined;
  remove: (id: string) => void;
  clear: () => void;
}

export const useSnapshotStore = create<SnapshotStore>()(
  persist(
    (set, get) => ({
      snapshots: [],

      save: (name, code, componentName, language) => set((s) => ({
        snapshots: [
          { id: crypto.randomUUID(), name, code, componentName, language, savedAt: Date.now() },
          ...s.snapshots,
        ].slice(0, 50),
      })),

      restore: (id) => get().snapshots.find((s) => s.id === id),

      remove: (id) => set((s) => ({ snapshots: s.snapshots.filter((x) => x.id !== id) })),

      clear: () => set({ snapshots: [] }),
    }),
    { name: 'snapshot-store' }
  )
);
