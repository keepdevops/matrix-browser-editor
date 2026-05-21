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
  'font-family': string;
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
  'font-family': 'Inter, sans-serif',
};

export const TOKEN_LIGHT: TokenValues = {
  ...TOKEN_DEFAULTS,
  'color-background': '#f8fafc',
  'color-surface': '#ffffff',
  'color-text': '#0f172a',
  'color-border': '#e2e8f0',
};

const GOOGLE_FONTS: Record<string, string> = {
  Inter: 'Inter',
  'Roboto': 'Roboto',
  'Open Sans': 'Open+Sans',
  'Lato': 'Lato',
  'Poppins': 'Poppins',
  'Nunito': 'Nunito',
  'Playfair Display': 'Playfair+Display',
  'JetBrains Mono': 'JetBrains+Mono',
};

export { GOOGLE_FONTS };

export function applyTokens(code: string, tokens: TokenValues): string {
  const fontName = tokens['font-family'].split(',')[0].trim();
  const googleKey = GOOGLE_FONTS[fontName];
  const importLine = googleKey && fontName !== 'Inter'
    ? `@import url('https://fonts.googleapis.com/css2?family=${googleKey}:wght@400;500;600;700&display=swap');`
    : '';

  const block = [
    importLine,
    `:root {\n${(Object.entries(tokens) as [string, string][])
      .map(([k, v]) => `  --${k}: ${v};`)
      .join('\n')}\n}`,
  ].filter(Boolean).join('\n');

  // Replace existing :root block (and any preceding @import for fonts)
  const replaced = code.replace(/@import url\('https:\/\/fonts\.googleapis\.com[^']*'\);\n?:root\s*\{[^}]*\}|:root\s*\{[^}]*\}/, block);
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
