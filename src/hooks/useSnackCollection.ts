import { useState, useEffect, useCallback } from 'react';
import { logError } from '@/lib/errorHandling';

const STORAGE_KEY = 'snack-scout-collection';

export interface CollectedSnack {
  barcode: string;
  name: string;
  brand: string;
  icon: string;
  savedAt: number;
}

/**
 * The kid's "Safe Snacks Collection" — a local sticker shelf of snacks they've
 * found safe. Stores the snack name + brand (no re-fetching needed), keyed by
 * barcode for dedupe. Persisted to localStorage only (no accounts; COPPA-safe).
 */
export function useSnackCollection() {
  const [snacks, setSnacks] = useState<CollectedSnack[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSnacks(JSON.parse(stored));
      } catch (error) {
        logError('useSnackCollection', error);
      }
    }
  }, []);

  const save = (next: CollectedSnack[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  };

  const isCollected = useCallback(
    (barcode: string) => snacks.some((s) => s.barcode === barcode),
    [snacks],
  );

  const toggleSnack = useCallback((snack: Omit<CollectedSnack, 'savedAt'>) => {
    if (!snack.barcode) return;
    setSnacks((prev) =>
      prev.some((s) => s.barcode === snack.barcode)
        ? save(prev.filter((s) => s.barcode !== snack.barcode))
        : save([{ ...snack, savedAt: Date.now() }, ...prev]),
    );
  }, []);

  const removeSnack = useCallback((barcode: string) => {
    setSnacks((prev) => save(prev.filter((s) => s.barcode !== barcode)));
  }, []);

  return { snacks, isCollected, toggleSnack, removeSnack };
}

/** A playful Scout rank based on how many safe snacks the kid has collected. */
export function scoutRank(count: number): string {
  if (count >= 10) return 'Master Scout';
  if (count >= 6) return 'Super Scout';
  if (count >= 3) return 'Sharp Scout';
  if (count >= 1) return 'Rookie Scout';
  return 'New Scout';
}
