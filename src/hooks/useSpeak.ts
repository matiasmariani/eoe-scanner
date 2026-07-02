'use client';

import { useCallback } from 'react';

/**
 * Generic text-to-speech for accessibility — lets non-readers and visually
 * impaired kids hear any instruction, label, or result. Free (not premium):
 * accessibility should never be paywalled. Cancels any in-progress speech so
 * rapid taps don't stack up.
 */
export function useSpeak() {
  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
  }, []);

  const isSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  return { speak, stop, isSupported };
}
