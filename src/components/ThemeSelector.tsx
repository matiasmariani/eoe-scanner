'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Palette } from 'lucide-react';

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'minecraft' ? 'kitty' : 'minecraft')}
      className="group relative flex items-center justify-center w-14 h-14 bg-theme-accent text-theme-bg border-4 border-theme-border shadow-voxel transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
      aria-label="Toggle Theme"
    >
      <Palette className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-theme-text text-theme-bg text-xs font-bold px-2 py-1 rounded border-2 border-theme-border whitespace-nowrap pointer-events-none">
        {theme === 'minecraft' ? 'Switch to Kitty' : 'Switch to Blocky'}
      </span>
    </button>
  );
};
