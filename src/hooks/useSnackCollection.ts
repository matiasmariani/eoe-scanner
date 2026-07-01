import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { logError } from '@/lib/errorHandling';
import { db, dbService, CollectedSnack } from '@/lib/db';

/**
 * The kid's "Safe Snacks Collection" — a local sticker shelf of snacks they've
 * found safe. Stores the snack name + brand (no re-fetching needed), keyed by
 * barcode for dedupe. Persisted to IndexedDB.
 */
export function useSnackCollection() {
  const snacks = useLiveQuery(() => db.collection.toArray(), []) ?? [];

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
        const existing = await dbService.getCollectedSnack(snack.barcode);
        if (existing) {
          await dbService.deleteFromCollection(snack.barcode);
        } else {
          const newSnack: CollectedSnack = {
            ...snack,
            savedAt: Date.now(),
          };
          await dbService.addToCollection(newSnack);
        }
      } catch (error) {
        logError('useSnackCollection-toggle', error);
      }
    },
    [],
  );

  const removeSnack = useCallback(async (barcode: string) => {
    try {
      await dbService.deleteFromCollection(barcode);
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
