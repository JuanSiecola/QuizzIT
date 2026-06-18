// src/constants/theme.ts

export const colors = {
  background: '#0A0A12',
  surface: '#14141E',
  inputBg: '#16161F',
  primary: '#6D4AFF',
  primaryDark: '#5A3AE0',
  accent: '#35D6CE',
  textPrimary: '#FFFFFF',
  textSecondary: '#9A9AAE',
  textMuted: '#6B6B7B',
  border: '#2A2A38',
  error: '#FF5C5C',
  success: '#35D68C',
} as const;

export const spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;

export const fontSizes = {
  small: 13,
  label: 14,
  body: 16,
  heading: 24,
  title: 32,
  hero: 40,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const fonts = {
  regular: 'System',
  mono: 'monospace',
} as const;

// Compatibilidad con el resto del código
export const Colors = {
  light: {
    background: colors.background,
    backgroundElement: colors.surface,
    backgroundSelected: colors.inputBg,
    text: colors.textPrimary,
    textSecondary: colors.textSecondary,
    border: colors.border,
    tint: colors.primary,
    icon: colors.textSecondary,
    tabIconDefault: colors.textMuted,
    tabIconSelected: colors.primary,
  },
  dark: {
    background: colors.background,
    backgroundElement: colors.surface,
    backgroundSelected: colors.inputBg,
    text: colors.textPrimary,
    textSecondary: colors.textSecondary,
    border: colors.border,
    tint: colors.primary,
    icon: colors.textSecondary,
    tabIconDefault: colors.textMuted,
    tabIconSelected: colors.primary,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;
export const Spacing = spacing;
export const Fonts = fonts;
export const MaxContentWidth = 960;
