'use client';

import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Palette } from 'lucide-react';

export const ThemeSelector = () => {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return <div className="p-3 w-fit" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-3 bg-theme-bg border-4 border-theme-border rounded-2xl shadow-voxel active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all hover:-translate-y-[2px]"
      aria-label={`Toggle theme (currently ${theme})`}
      title={
        theme === 'minecraft'
          ? 'Switch to Kitty Theme 🎀'
          : 'Switch to Minecraft Theme ⛏️'
      }
    >
      <Palette className="w-6 h-6 text-theme-accent" aria-hidden="true" />
    </button>
  );
};
