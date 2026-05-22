import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ComponentVersion {
  code: string;
  savedAt: number;
  label?: string;
}

export interface SavedComponent {
  id: string;
  name: string;
  code: string;
  language: 'tsx' | 'jsx' | 'ts' | 'js';
  description: string;
  savedAt: number;
  versions: ComponentVersion[];
}

interface LibraryState {
  components: SavedComponent[];
  save: (c: Omit<SavedComponent, 'id' | 'savedAt' | 'versions'>) => void;
  remove: (id: string) => void;
  restoreVersion: (id: string, versionIndex: number) => void;
  clear: () => void;
}

export const useLibraryStore = create<LibraryState>()(persist((set) => ({
  components: [],

  save: (c) => set((s) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const existing = s.components.findIndex((x) => x.name === c.name);
    if (existing >= 0) {
      const prev = s.components[existing];
      const updated = [...s.components];
      const newVersion: ComponentVersion = { code: prev.code, savedAt: prev.savedAt };
      updated[existing] = {
        ...prev, ...c, savedAt: Date.now(),
        versions: [newVersion, ...(prev.versions ?? [])].slice(0, 20),
      };
      return { components: updated };
    }
    return { components: [{ ...c, id, savedAt: Date.now(), versions: [] }, ...s.components] };
  }),

  remove: (id) => set((s) => ({ components: s.components.filter((c) => c.id !== id) })),

  restoreVersion: (id, versionIndex) => set((s) => {
    const idx = s.components.findIndex((c) => c.id === id);
    if (idx < 0) return s;
    const comp = s.components[idx];
    const ver = comp.versions[versionIndex];
    if (!ver) return s;
    const updated = [...s.components];
    const currentAsVersion: ComponentVersion = { code: comp.code, savedAt: comp.savedAt };
    updated[idx] = {
      ...comp, code: ver.code, savedAt: Date.now(),
      versions: [currentAsVersion, ...comp.versions.filter((_, i) => i !== versionIndex)].slice(0, 20),
    };
    return { components: updated };
  }),

  clear: () => set({ components: [] }),
}), { name: 'component-library' }));
