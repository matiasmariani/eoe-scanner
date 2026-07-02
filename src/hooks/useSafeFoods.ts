'use client';

import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { dbService, SafeFood } from '@/lib/db';

export function useSafeFoods(profileId?: string) {
  const [error, setError] = useState<string | null>(null);

  const safeFoods = useLiveQuery(
    () =>
      profileId
        ? dbService.getSafeFoodsByProfile(profileId)
        : Promise.resolve([]),
    [profileId],
  );

  const addSafeFood = useCallback(
    async (safeFood: Omit<SafeFood, 'id' | 'addedAt' | 'profileId'>) => {
      if (!profileId) return;
      try {
        await dbService.addSafeFood({
          id: crypto.randomUUID(),
          ...safeFood,
          profileId,
          addedAt: Date.now(),
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add');
      }
    },
    [profileId],
  );

  const deleteSafeFood = useCallback(async (id: string) => {
    try {
      await dbService.deleteSafeFood(id);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  }, []);

  const updateSafeFood = useCallback(
    async (id: string, updates: Partial<SafeFood>) => {
      try {
        await dbService.updateSafeFood(id, updates);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update');
      }
    },
    [],
  );

  return {
    safeFoods: safeFoods ?? [],
    addSafeFood,
    deleteSafeFood,
    updateSafeFood,
    error,
    setError,
  };
}
