'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface SnackScoutProps {
  /** "lg" for the hero/header wordmark, "sm" for compact placements. */
  size?: 'lg' | 'sm';
  className?: string;
}

/**
 * Snack Scout wordmark + mascot. The app's brand lockup.
 */
export function SnackScout({ size = 'lg', className }: SnackScoutProps) {
  const { theme } = useTheme();
  const isLarge = size === 'lg';
  const mascot = theme === 'kitty' ? '🕵️‍♀️' : '🕵️';

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-grass-green border-4 border-ink-navy rounded-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
        isLarge ? 'gap-3 px-6 py-3 w-full' : 'gap-2 px-4 py-2',
        className,
      )}
    >
      <span
        className={isLarge ? 'text-3xl' : 'text-2xl'}
        role="img"
        aria-label={
          theme === 'kitty' ? 'Female detective scout' : 'Detective scout'
        }
      >
        {mascot}
      </span>
      <span
        className={cn(
          'font-display font-black text-block-white tracking-tight',
          isLarge ? 'text-3xl' : 'text-xl',
        )}
      >
        Snack Scout
      </span>
    </div>
  );
}
