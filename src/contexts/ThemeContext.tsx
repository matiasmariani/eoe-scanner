'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'minecraft' | 'kitty';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Seed from the value the pre-paint inline script in layout.tsx already set on
  // <html>, so React's state matches the DOM and we don't flash the wrong theme.
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document !== 'undefined') {
      const attr = document.documentElement.getAttribute('data-theme');
      if (attr === 'minecraft' || attr === 'kitty') return attr;
    }
    return 'minecraft';
  });

  // Persist + apply on change only (the initial value already matches the DOM).
  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
