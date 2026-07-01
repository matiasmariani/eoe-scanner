import Dexie, { Table } from 'dexie';
import { type Allergy } from '@/lib/constants';
import { type ProductResult } from '@/lib/open-food-facts';

export type ScannedProduct = {
  barcode: string;
  name: string;
  brand: string;
  isSafe: boolean;
  allergensFound: string[];
  timestamp: number;
  source: string;
  icon: string;
  ingredients: string;
};

export type CollectedSnack = {
  barcode: string;
  name: string;
  brand: string;
  icon: string;
  savedAt: number;
};

export type AllergySettings = {
  id: 'current';
  allergies: Allergy[];
};

export interface HistoryItem {
  id: number;
  barcode: string;
  result: ProductResult;
  timestamp: number;
}

export class AllergyScoutDB extends Dexie {
  scans!: Table<ScannedProduct>;
  collection!: Table<CollectedSnack>;
  settings!: Table<AllergySettings>;
  history!: Table<HistoryItem>;

  constructor() {
    super('AllergyScoutDB');

    // Version 1: Initial schema
    this.version(1).stores({
      scans: 'barcode',
      collection: 'barcode',
      settings: 'id',
      history: '++id, barcode, timestamp',
    });

    // Version 2: Add indexes for better query performance
    this.version(2).stores({
      scans: 'barcode, timestamp',
      collection: 'barcode, savedAt',
      settings: 'id',
      history: '++id, barcode, timestamp',
    });
  }
}

export const db = new AllergyScoutDB();

export class DBService {
  async getScans(): Promise<ScannedProduct[]> {
    return db.scans.toArray();
  }

  async saveScan(product: ScannedProduct) {
    return db.scans.put(product);
  }

  async removeFromCollection(barcode: string) {
    return db.collection.delete(barcode);
  }

  async getSettings(): Promise<AllergySettings | undefined> {
    return db.settings.get('current');
  }

  async saveSettings(settings: AllergySettings) {
    return db.settings.put(settings);
  }

  async addToCollection(snack: CollectedSnack) {
    return db.collection.put(snack);
  }

  async deleteFromCollection(barcode: string) {
    return db.collection.delete(barcode);
  }

  async clearSettings() {
    return db.settings.clear();
  }
}

export const dbService = new DBService();
