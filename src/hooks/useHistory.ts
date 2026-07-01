'use client';

import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { HistoryItem } from '@/lib/db';
import { db } from '@/lib/db';
import {
  saveHistoryItem,
  deleteHistoryItem,
  getHistoryByBarcode,
} from '@/lib/history-db';
import { ProductResult } from '@/lib/open-food-facts';
import { logError } from '@/lib/errorHandling';

export function useHistory() {
  const history = useLiveQuery(
    () => db.history.orderBy('timestamp').reverse().toArray(),
    [],
  );

  const checkCache = useCallback(async (barcode: string) => {
    try {
      return await getHistoryByBarcode(barcode);
    } catch (error) {
      logError('useHistory-checkCache', error);
      return null;
    }
  }, []);

  const addHistory = async (barcode: string, result: ProductResult) => {
    try {
      await saveHistoryItem(barcode, result);
    } catch (error) {
      logError('useHistory-add', error);
    }
  };

  const removeHistory = async (id: number) => {
    try {
      await deleteHistoryItem(id);
    } catch (error) {
      logError('useHistory-remove', error);
    }
  };

  return {
    history,
    addHistory,
    removeHistory,
    checkCache,
  };
}
