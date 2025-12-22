// constants/theme.ts

export const PALETTES = {
  dark: {
    background: '#101322',
    card: '#1c1d27',
    text: '#ffffff',
    textSecondary: '#9da1b9',
    primary: '#1337ec',
    border: 'rgba(255, 255, 255, 0.1)',
    input: '#1c1d27',
    tint: '#ffffff',
    statusBarStyle: 'light',
  },
  light: {
    background: '#f8fafc', // Slate-50
    card: '#ffffff',
    text: '#0f172a', // Slate-900
    textSecondary: '#64748b', // Slate-500
    primary: '#2563eb', // Blue-600
    border: 'rgba(0, 0, 0, 0.1)',
    input: '#e2e8f0', // Slate-200
    tint: '#0f172a',
    statusBarStyle: 'dark',
  },
  sunset: {
    background: '#2a1b2d', // Deep Purple/Brown
    card: '#442b40', // Lighter mauve
    text: '#ffe4e1', // Misty Rose
    textSecondary: '#d8bfd8', // Thistle
    primary: '#f97316', // Orange-500
    border: 'rgba(255, 200, 200, 0.15)',
    input: '#442b40',
    tint: '#fb923c',
    statusBarStyle: 'light',
  }
};

export type ThemeType = keyof typeof PALETTES;
export type ThemeMode = 'dynamic' | ThemeType;