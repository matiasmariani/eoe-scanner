'use client';

import { useEffect, useSyncExternalStore } from 'react';
import {
  getTheme as getThemeFromDB,
  setTheme as setThemeInDB,
  type Theme,
} from '@/lib/theme-db';

const THEMES: Theme[] = ['minecraft', 'kitty'];

// Module-level store shared by every useTheme() caller. A plain useState here
// would give each component its OWN theme copy — toggling in ThemeSelector
// would never re-render SnackScout or anything else.
let currentTheme: Theme = 'minecraft';
let mountedState = false;
let initStarted = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getThemeSnapshot = () => currentTheme;
const getThemeServerSnapshot = (): Theme => 'minecraft';
const getMountedSnapshot = () => mountedState;
const getMountedServerSnapshot = () => false;

async function initTheme() {
  if (initStarted) return;
  initStarted = true;
  try {
    const stored = await getThemeFromDB();
    currentTheme = stored;
    document.documentElement.setAttribute('data-theme', stored);
  } catch (error) {
    console.error('Failed to load theme:', error);
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    currentTheme = prefersDark ? 'minecraft' : 'kitty';
    document.documentElement.setAttribute('data-theme', currentTheme);
    setThemeInDB(currentTheme);
  }
  mountedState = true;
  emit();
}

async function setThemeShared(newTheme: Theme) {
  // Update store and DOM immediately for responsive UI
  currentTheme = newTheme;
  document.documentElement.setAttribute('data-theme', newTheme);
  emit();
  // Persist to IndexedDB in background
  try {
    await setThemeInDB(newTheme);
  } catch (error) {
    console.error('Failed to persist theme:', error);
  }
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );
  const mounted = useSyncExternalStore(
    subscribe,
    getMountedSnapshot,
    getMountedServerSnapshot,
  );

  useEffect(() => {
    initTheme();
  }, []);

  const toggleTheme = async () => {
    const next = currentTheme === 'minecraft' ? 'kitty' : 'minecraft';
    await setThemeShared(next);
  };

  return {
    theme,
    setTheme: setThemeShared,
    toggleTheme,
    mounted,
    availableThemes: THEMES,
  };
}
