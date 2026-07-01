'use client';

import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, dbService } from '@/lib/db';
import { ProductResult } from '@/lib/open-food-facts';

export function useHistory() {
  const history = useLiveQuery(
    () => db.history.orderBy('timestamp').reverse().toArray(),
    [],
  );

  const addHistory = useCallback(
    async (barcode: string, result: ProductResult) => {
      await dbService.saveHistory(barcode, result);
    },
    [],
  );

  const removeHistory = useCallback(async (barcode: string) => {
    await dbService.deleteHistory(barcode);
  }, []);

  return {
    history,
    addHistory,
    removeHistory,
  };
}
