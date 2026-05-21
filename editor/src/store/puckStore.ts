import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Data } from '@measured/puck';

const EMPTY_DATA: Data = { content: [], zones: {} };

interface PuckStoreState {
  data: Data;
  setData: (d: Data) => void;
  resetData: () => void;
}

export const usePuckStore = create<PuckStoreState>()(
  persist(
    (set) => ({
      data: EMPTY_DATA,
      setData: (data) => set({ data }),
      resetData: () => set({ data: { ...EMPTY_DATA, content: [], zones: {} } }),
    }),
    { name: 'puck-canvas' }
  )
);
