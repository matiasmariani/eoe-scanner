'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Palette } from 'lucide-react';

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'minecraft' ? 'kitty' : 'minecraft')}
      className="p-2 bg-theme-bg border-4 border-theme-border rounded-2xl shadow-voxel active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all hover:-translate-y-[2px]"
      aria-label={`Toggle theme (currently ${theme})`}
      title={theme === 'minecraft' ? 'Switch to Kitty' : 'Switch to Blocky'}
    >
      <Palette className="w-6 h-6 text-theme-accent" aria-hidden="true" />
    </button>
  );
};
