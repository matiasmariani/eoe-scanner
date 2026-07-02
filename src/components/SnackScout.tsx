'use client';

import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Astronaut, HumanCat } from 'react-kawaii';
import { cn } from '@/lib/utils';

interface SnackScoutProps {
  /** "lg" for the hero/header wordmark, "sm" for compact placements. */
  size?: 'lg' | 'sm';
  className?: string;
}

/**
 * SnackBuddy wordmark + mascot. The app's brand lockup with our friendly astronaut companion.
 */
export function SnackScout({ size = 'lg', className }: SnackScoutProps) {
  const { theme } = useTheme();
  const isLarge = size === 'lg';

  return (
    <div
      key={theme}
      className={cn(
        'flex items-center justify-center bg-theme-primary rounded-full shadow-lg',
        isLarge ? 'gap-3 px-6 py-3 w-full' : 'gap-2 px-4 py-2',
        className,
      )}
    >
      {theme === 'minecraft' ? (
        <Astronaut size={isLarge ? 80 : 60} mood="happy" color="#FF8C42" />
      ) : (
        <HumanCat size={isLarge ? 80 : 60} mood="happy" color="#79d461" />
      )}
      <span
        className={cn(
          'font-display font-black text-theme-text tracking-tight',
          isLarge ? 'text-3xl' : 'text-xl',
        )}
      >
        SnackBuddy
      </span>
    </div>
  );
}
