import React from 'react';
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
  const isLarge = size === 'lg';
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-grass-green border-4 border-ink-navy rounded-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
        isLarge ? 'gap-4 px-10 py-5 w-full' : 'gap-2 px-5 py-2',
        className
      )}
    >
      <span className={isLarge ? 'text-4xl' : 'text-2xl'} role="img" aria-label="Detective scout">
        🕵️
      </span>
      <span
        className={cn(
          'font-display font-black text-block-white tracking-tight',
          isLarge ? 'text-4xl' : 'text-xl'
        )}
      >
        Snack Scout
      </span>
    </div>
  );
}
