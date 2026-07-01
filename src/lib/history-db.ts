import { ProductResult } from '@/lib/open-food-facts';
import { db, type HistoryItem } from '@/lib/db';
import { logError } from '@/lib/errorHandling';

export const saveHistoryItem = async (
  barcode: string,
  result: ProductResult,
): Promise<void> => {
  try {
    await db.history.add({
      barcode,
      result,
      timestamp: Date.now(),
      id: undefined as unknown as number,
    });
  } catch (error) {
    logError('saveHistoryItem', error);
  }
};

export const getHistoryByBarcode = async (
  barcode: string,
): Promise<HistoryItem | null> => {
  try {
    const item = await db.history.where('barcode').equals(barcode).first();
    return item ?? null;
  } catch (error) {
    logError('getHistoryByBarcode', error);
    return null;
  }
};

export const getAllHistory = async (): Promise<HistoryItem[]> => {
  try {
    return db.history.orderBy('timestamp').reverse().toArray();
  } catch (error) {
    logError('getAllHistory', error);
    return [];
  }
};

export const deleteHistoryItem = async (id: number): Promise<void> => {
  try {
    await db.history.delete(id);
  } catch (error) {
    logError('deleteHistoryItem', error);
  }
};
