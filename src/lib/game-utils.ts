import { type HistoryItem } from '@/lib/db';
import { recomputeVerdict } from '@/lib/allergen-utils';

/** A snack from scan history, prepared for the mini-games. */
export interface GameCard {
  barcode: string;
  name: string;
  brand: string;
  image_url?: string;
  icon?: string;
  isSafe: boolean;
  allergensFound: string[];
  /** A–E Nutri-Score grade, if known (used by the comparison game). */
  nutriscoreGrade?: string;
}

export const MIN_CARDS = 4;
export const SORT_DECK_SIZE = 10;

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

/**
 * Builds a shuffled game deck from scan history.
 *
 * History is shared across profiles but each item's stored verdict was
 * computed against whichever profile was active at scan time — so the verdict
 * is recomputed here against the CURRENT profile's allergies (same pattern as
 * the scan-cache path). Falls back to the stored verdict for old records
 * without matchText.
 */
export function buildDeck(
  history: HistoryItem[],
  allergies: string[],
  size?: number,
): GameCard[] {
  const seen = new Set<string>();
  const cards: GameCard[] = [];

  for (const item of history) {
    if (seen.has(item.barcode)) continue;
    seen.add(item.barcode);

    const { result } = item;
    if (result.error || !result.name || result.name === 'Unknown Product') {
      continue;
    }

    const verdict = result.matchText
      ? recomputeVerdict(result.matchText, allergies)
      : { isSafe: result.isSafe, allergensFound: result.allergensFound };

    cards.push({
      barcode: item.barcode,
      name: result.name,
      brand: result.brand,
      image_url: result.image_url,
      icon: result.icon,
      isSafe: verdict.isSafe,
      allergensFound: verdict.allergensFound,
      nutriscoreGrade: result.nutriscore_grade,
    });
  }

  const shuffled = shuffle(cards);
  return size ? shuffled.slice(0, size) : shuffled;
}

/** Streak multiplier: x1 below 3, x2 at 3–5, x3 at 6+. */
export function streakMultiplier(streak: number): number {
  return 1 + Math.min(Math.floor(streak / 3), 2);
}
