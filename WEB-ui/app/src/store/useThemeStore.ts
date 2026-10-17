import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light';

const THEME_STORAGE_KEY = 'reporiddle_theme';

interface ThemeStore {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export function applyThemeToDocumentRoot(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
  }
}

export function getSavedTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  return 'dark';
}

export function persistThemeChoice(theme: ThemeMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  localStorage.setItem('theme', theme);
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: getSavedTheme(),
  setTheme: (theme: ThemeMode) => {
    persistThemeChoice(theme);
    applyThemeToDocumentRoot(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const nextTheme: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },
}));

if (typeof window !== 'undefined') {
  applyThemeToDocumentRoot(getSavedTheme());
}
