'use client';

import { getAllergenDisplay } from '@/lib/allergen-utils';
import { useSpeak } from '@/hooks/useSpeak';

export function useSpeakResult() {
  const { speak: speakText } = useSpeak();

  function speak(
    profileName: string,
    productName: string,
    isSafe: boolean,
    allergensFound: string[],
  ) {
    if (isSafe) {
      speakText(`${profileName}, ${productName} is safe!`);
    } else {
      const list = allergensFound
        .map((a) => getAllergenDisplay(a).label)
        .join(', ');
      speakText(
        `Warning! ${profileName}, ${productName} is not safe. It has ${list}.`,
      );
    }
  }

  return { speak };
}
