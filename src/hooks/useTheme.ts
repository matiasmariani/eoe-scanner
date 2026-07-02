'use client';

import { useEffect, useState } from 'react';

export type Theme = 'minecraft' | 'kitty';

const THEMES: Theme[] = ['minecraft', 'kitty'];
const STORAGE_KEY = 'snack-scout-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('minecraft');
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && THEMES.includes(stored as Theme)) {
      setThemeState(stored as Theme);
      document.documentElement.setAttribute('data-theme', stored);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      const defaultTheme = prefersDark ? 'minecraft' : 'kitty';
      setThemeState(defaultTheme);
      document.documentElement.setAttribute('data-theme', defaultTheme);
      localStorage.setItem(STORAGE_KEY, defaultTheme);
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  };

  const toggleTheme = () => {
    const next = theme === 'minecraft' ? 'kitty' : 'minecraft';
    setTheme(next);
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    mounted,
    availableThemes: THEMES,
  };
}
