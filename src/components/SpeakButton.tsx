'use client';

import React from 'react';
import { Volume2 } from 'lucide-react';
import { useSpeak } from '@/hooks/useSpeak';
import { cn } from '@/lib/utils';

interface SpeakButtonProps {
  /** The text to read aloud when tapped. */
  text: string;
  size?: 'sm' | 'md';
  className?: string;
  /** Accessible label; defaults to "Read aloud". */
  label?: string;
}

/**
 * Small speaker button that reads `text` aloud — drop it next to any
 * instruction, heading, or label so non-readers and visually impaired kids
 * can hear it. Stops event propagation so it works safely inside clickable
 * cards. Renders nothing when speech synthesis is unavailable.
 */
export function SpeakButton({
  text,
  size = 'md',
  className,
  label,
}: SpeakButtonProps) {
  const { speak, isSupported } = useSpeak();

  if (!isSupported) return null;

  const dims = size === 'sm' ? 'w-8 h-8' : 'w-11 h-11';
  const icon = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
      className={cn(
        'flex items-center justify-center rounded-full bg-white text-theme-text shadow-lg active:scale-90 transition-transform shrink-0',
        dims,
        className,
      )}
      aria-label={label ?? 'Read aloud'}
      title="Read aloud"
    >
      <Volume2 className={icon} aria-hidden="true" />
    </button>
  );
}
