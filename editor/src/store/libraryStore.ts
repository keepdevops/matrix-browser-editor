import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedComponent {
  id: string;
  name: string;
  code: string;
  language: 'tsx' | 'jsx' | 'ts' | 'js';
  description: string;
  savedAt: number;
}

interface LibraryState {
  components: SavedComponent[];
  save: (c: Omit<SavedComponent, 'id' | 'savedAt'>) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useLibraryStore = create<LibraryState>()(persist((set) => ({
  components: [],

  save: (c) => set((s) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const existing = s.components.findIndex((x) => x.name === c.name);
    if (existing >= 0) {
      const updated = [...s.components];
      updated[existing] = { ...updated[existing], ...c, savedAt: Date.now() };
      return { components: updated };
    }
    return { components: [{ ...c, id, savedAt: Date.now() }, ...s.components] };
  }),

  remove: (id) => set((s) => ({ components: s.components.filter((c) => c.id !== id) })),

  clear: () => set({ components: [] }),
}), { name: 'component-library' }));
