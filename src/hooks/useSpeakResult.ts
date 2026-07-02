'use client';

import { getAllergenDisplay } from '@/lib/allergen-utils';

export function useSpeakResult() {
  function speak(
    profileName: string,
    productName: string,
    isSafe: boolean,
    allergensFound: string[],
  ) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    let text: string;
    if (isSafe) {
      text = `${profileName}, ${productName} is safe!`;
    } else {
      const list = allergensFound
        .map((a) => getAllergenDisplay(a).label)
        .join(', ');
      text = `Warning! ${profileName}, ${productName} is not safe. It has ${list}.`;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }

  return { speak };
}
