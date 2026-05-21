import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TokenValues {
  'color-primary': string;
  'color-secondary': string;
  'color-background': string;
  'color-surface': string;
  'color-text': string;
  'color-border': string;
  'spacing-unit': string;
  'border-radius': string;
  'font-size-base': string;
}

export const TOKEN_DEFAULTS: TokenValues = {
  'color-primary': '#6366f1',
  'color-secondary': '#8b5cf6',
  'color-background': '#0f172a',
  'color-surface': '#1e293b',
  'color-text': '#f1f5f9',
  'color-border': '#334155',
  'spacing-unit': '4px',
  'border-radius': '8px',
  'font-size-base': '16px',
};

export function applyTokens(code: string, tokens: TokenValues): string {
  const block = `:root {\n${(Object.entries(tokens) as [string, string][])
    .map(([k, v]) => `  --${k}: ${v};`)
    .join('\n')}\n}`;
  const replaced = code.replace(/:root\s*\{[^}]*\}/, block);
  return replaced !== code ? replaced : block + '\n\n' + code;
}

interface TokenStore {
  tokens: TokenValues;
  setToken: (key: keyof TokenValues, value: string) => void;
  resetTokens: () => void;
}

export const useTokenStore = create<TokenStore>()(
  persist(
    (set) => ({
      tokens: { ...TOKEN_DEFAULTS },
      setToken: (key, value) => set((s) => ({ tokens: { ...s.tokens, [key]: value } })),
      resetTokens: () => set({ tokens: { ...TOKEN_DEFAULTS } }),
    }),
    { name: 'token-store' }
  )
);
