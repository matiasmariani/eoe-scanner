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
  image_url?: string;
  savedAt: number;
};

export type SettingsRecord = {
  id: string;
  allergies?: Allergy[];
  value?: string;
};

export type Profile = {
  id: string;
  name: string;
  emoji: string;
  allergies: Allergy[];
  createdAt: number;
  isAdult?: boolean;
};

export type SafeFood = {
  id: string;
  profileId: string;
  name: string;
  brand?: string;
  notes?: string;
  source: 'scanned' | 'manual';
  addedAt: number;
};

export interface HistoryItem {
  barcode: string;
  result: ProductResult;
  timestamp: number;
}

export class AllergyScoutDB extends Dexie {
  scans!: Table<ScannedProduct>;
  collection!: Table<CollectedSnack>;
  settings!: Table<SettingsRecord, string>;
  history!: Table<HistoryItem>;
  profiles!: Table<Profile>;
  safeFoods!: Table<SafeFood>;

  constructor() {
    super('AllergyScoutDB');

    // Version 1: Initial schema
    this.version(1).stores({
      scans: 'barcode',
      collection: 'barcode',
      settings: 'id',
      history: 'barcode, timestamp',
    });

    // Version 2: Add indexes for better query performance
    this.version(2).stores({
      scans: 'barcode, timestamp',
      collection: 'barcode, savedAt',
      settings: 'id',
      history: 'barcode, timestamp',
    });

    // Version 3: Add profiles table
    this.version(3)
      .stores({
        scans: 'barcode, timestamp',
        collection: 'barcode, savedAt',
        settings: 'id',
        history: 'barcode, timestamp',
        profiles: '++id, name, createdAt',
      })
      .upgrade((tx) => {
        // Migration: create default profile from existing settings
        return tx
          .table('settings')
          .get('current')
          .then((settings) => {
            if (settings && settings.allergies) {
              return tx.table('profiles').add({
                id: 'default-profile',
                name: 'Me',
                emoji: '😊',
                allergies: settings.allergies,
                createdAt: Date.now(),
              });
            }
            return undefined;
          });
      });

    // Version 4: Add safeFoods table
    this.version(4).stores({
      scans: 'barcode, timestamp',
      collection: 'barcode, savedAt',
      settings: 'id',
      history: 'barcode, timestamp',
      profiles: '++id, name, createdAt',
      safeFoods: '++id, profileId',
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

  async getSettings(): Promise<SettingsRecord | undefined> {
    return db.settings.get('current');
  }

  async saveSettings(settings: SettingsRecord) {
    return db.settings.put(settings);
  }

  async addToCollection(snack: CollectedSnack) {
    return db.collection.put(snack);
  }

  async getCollectedSnack(
    barcode: string,
  ): Promise<CollectedSnack | undefined> {
    return db.collection.get(barcode);
  }

  async deleteFromCollection(barcode: string) {
    return db.collection.delete(barcode);
  }

  async clearSettings() {
    return db.settings.clear();
  }

  async saveHistory(barcode: string, result: ProductResult) {
    return db.history.put({
      barcode,
      result,
      timestamp: Date.now(),
    });
  }

  async getHistoryByBarcode(barcode: string): Promise<HistoryItem | null> {
    return (await db.history.get(barcode)) ?? null;
  }

  async getAllHistory(): Promise<HistoryItem[]> {
    return db.history.orderBy('timestamp').reverse().toArray();
  }

  async deleteHistory(barcode: string) {
    return db.history.delete(barcode);
  }

  async getAdultPin(): Promise<string | undefined> {
    const record = await db.settings.get('adultPin');
    return record?.value;
  }

  async saveAdultPin(pin: string) {
    return db.settings.put({ id: 'adultPin', value: pin });
  }

  async getAdultSecurityQuestion(): Promise<string | undefined> {
    const record = await db.settings.get('adultSecurityQuestion');
    return record?.value;
  }

  async saveAdultSecurityQuestion(question: string) {
    return db.settings.put({ id: 'adultSecurityQuestion', value: question });
  }

  async getAdultSecurityAnswer(): Promise<string | undefined> {
    const record = await db.settings.get('adultSecurityAnswer');
    return record?.value;
  }

  async saveAdultSecurityAnswer(answer: string) {
    return db.settings.put({ id: 'adultSecurityAnswer', value: answer });
  }

  // Profile methods

  async getActiveProfileId(): Promise<string | undefined> {
    const record = await db.settings.get('activeProfileId');
    return record?.value;
  }

  async saveActiveProfileId(profileId: string) {
    return db.settings.put({ id: 'activeProfileId', value: profileId });
  }

  async getAllProfiles(): Promise<Profile[]> {
    return db.profiles.toArray();
  }

  async getProfile(id: string): Promise<Profile | undefined> {
    return db.profiles.get(id);
  }

  async saveProfile(profile: Profile) {
    return db.profiles.put(profile);
  }

  async deleteProfile(id: string) {
    return db.profiles.delete(id);
  }

  // Safe Foods methods
  async addSafeFood(safeFood: SafeFood): Promise<string> {
    return db.safeFoods.add(safeFood);
  }

  async getSafeFoodsByProfile(profileId: string): Promise<SafeFood[]> {
    return db.safeFoods
      .where('profileId')
      .equals(profileId)
      .reverse()
      .sortBy('addedAt');
  }

  async deleteSafeFood(id: string): Promise<void> {
    await db.safeFoods.delete(id);
  }

  async updateSafeFood(id: string, updates: Partial<SafeFood>): Promise<void> {
    await db.safeFoods.update(id, updates);
  }

  /**
   * Clears one profile's associated data: its safe foods and its per-profile
   * game stats (settings keyed `gameStats:<game>:<profileId>`). Called when a
   * profile is deleted so no orphaned data lingers. (History/collection/scans
   * are shared across profiles and are left intact.)
   */
  async deleteProfileData(profileId: string): Promise<void> {
    await db.safeFoods.where('profileId').equals(profileId).delete();
    const settings = await db.settings.toArray();
    await Promise.all(
      settings
        .filter((record) => record.id.endsWith(`:${profileId}`))
        .map((record) => db.settings.delete(record.id)),
    );
  }
}

export const dbService = new DBService();
