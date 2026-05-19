export const color = {
  bg: {
    base: 'var(--color-bg-base)',
    surface: 'var(--color-bg-surface)',
    elevated: 'var(--color-bg-elevated)',
    overlay: 'var(--color-bg-overlay)',
  },
  text: {
    primary: 'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    muted: 'var(--color-text-muted)',
    accent: 'var(--color-text-accent)',
  },
  border: {
    subtle: 'var(--color-border-subtle)',
    default: 'var(--color-border-default)',
  },
  accent: {
    primary: 'var(--color-accent-primary)',
    hover: 'var(--color-accent-hover)',
    muted: 'var(--color-accent-muted)',
  },
  status: {
    success: 'var(--color-status-success)',
    error: 'var(--color-status-error)',
    warning: 'var(--color-status-warning)',
    info: 'var(--color-status-info)',
  },
} as const;

export const space = {
  xs: 'var(--space-xs)',
  sm: 'var(--space-sm)',
  md: 'var(--space-md)',
  lg: 'var(--space-lg)',
  xl: 'var(--space-xl)',
} as const;

export const radius = {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
} as const;

export const font = {
  sans: 'var(--font-sans)',
  mono: 'var(--font-mono)',
  size: {
    xs: 'var(--font-size-xs)',
    sm: 'var(--font-size-sm)',
    md: 'var(--font-size-md)',
    lg: 'var(--font-size-lg)',
    xl: 'var(--font-size-xl)',
  },
} as const;
