'use client';

import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { UserRound, Heart } from 'lucide-react';

export const ThemeSelector = () => {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return <div className="w-fit" />;
  }

  return (
    <div className="flex items-center gap-1 bg-white/70 rounded-full p-1.5 shadow-lg border-2 border-white/50">
      <button
        onClick={() => {
          if (theme !== 'minecraft') toggleTheme();
        }}
        className={`p-2.5 rounded-full transition-all font-black text-sm flex items-center justify-center ${
          theme === 'minecraft'
            ? 'bg-theme-primary text-theme-text shadow-md scale-110'
            : 'text-theme-text/60 hover:text-theme-text'
        }`}
        aria-label="Boy theme"
        title="Boy Theme"
      >
        👦
      </button>
      <button
        onClick={() => {
          if (theme !== 'kitty') toggleTheme();
        }}
        className={`p-2.5 rounded-full transition-all font-black text-sm flex items-center justify-center ${
          theme === 'kitty'
            ? 'bg-theme-primary text-theme-text shadow-md scale-110'
            : 'text-theme-text/60 hover:text-theme-text'
        }`}
        aria-label="Girl theme"
        title="Girl Theme"
      >
        👧
      </button>
    </div>
  );
};
