import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { logError } from '@/lib/errorHandling';
import { db, dbService, CollectedSnack } from '@/lib/db';

/**
 * The kid's "Safe Snacks Collection" — a local sticker shelf of snacks they've
 * found safe. Stores the snack name + brand (no re-fetching needed), keyed by
 * barcode for dedupe. Persisted to IndexedDB.
 */
export function useSnackCollection() {
  const [snacks, setSnacks] = useState<CollectedSnack[]>([]);

  const dbSnacks = useLiveQuery(() => db.collection.toArray(), []);

  // Sync DB data into local state so optimistic updates work
  if (dbSnacks !== undefined && dbSnacks !== snacks) {
    setSnacks(dbSnacks);
  }

  const isCollected = useCallback(
    (barcode: string) => snacks.some((s) => s.barcode === barcode),
    [snacks],
  );

  const toggleSnack = useCallback(
    async (
      snack: Omit<CollectedSnack, 'savedAt' | 'barcode'> & { barcode: string },
    ) => {
      if (!snack.barcode) return;

      try {
        const isAlreadyCollected = snacks.some(
          (s) => s.barcode === snack.barcode,
        );
        if (isAlreadyCollected) {
          await dbService.deleteFromCollection(snack.barcode);
          setSnacks((prev) => prev.filter((s) => s.barcode !== snack.barcode));
        } else {
          const newSnack: CollectedSnack = {
            ...snack,
            savedAt: Date.now(),
          };
          await dbService.addToCollection(newSnack);
          setSnacks((prev) => [newSnack, ...prev]);
        }
      } catch (error) {
        logError('useSnackCollection-toggle', error);
      }
    },
    [snacks],
  );

  const removeSnack = useCallback(async (barcode: string) => {
    try {
      await dbService.deleteFromCollection(barcode);
      setSnacks((prev) => prev.filter((s) => s.barcode !== barcode));
    } catch (error) {
      logError('useSnackCollection-remove', error);
    }
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
