import { ProductResult } from './open-food-facts';

const DB_NAME = 'snackbuddy';
const PRODUCTS_STORE = 'products';

let dbInstance: IDBDatabase | null = null;

async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    // Version 2: 'settings' and 'products' stores share this DB (see theme-db.ts),
    // so both upgrade paths must create both stores.
    const request = indexedDB.open(DB_NAME, 2);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PRODUCTS_STORE)) {
        const store = db.createObjectStore(PRODUCTS_STORE, {
          keyPath: 'barcode',
        });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    };
  });
}

export async function saveProduct(product: ProductResult): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PRODUCTS_STORE, 'readwrite');
      const store = transaction.objectStore(PRODUCTS_STORE);
      const request = store.put({
        ...product,
        timestamp: Date.now(),
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Failed to save product to IndexedDB:', error);
  }
}

export async function getProduct(
  barcode: string,
): Promise<ProductResult | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PRODUCTS_STORE, 'readonly');
      const store = transaction.objectStore(PRODUCTS_STORE);
      const request = store.get(barcode);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as
          (ProductResult & { timestamp: number }) | undefined;
        resolve(result ? { ...result } : null);
      };
    });
  } catch (error) {
    console.error('Failed to get product from IndexedDB:', error);
    return null;
  }
}

export async function getAllProducts(): Promise<ProductResult[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PRODUCTS_STORE, 'readonly');
      const store = transaction.objectStore(PRODUCTS_STORE);
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result as (ProductResult & {
          timestamp: number;
        })[];
        resolve(results.map((r) => ({ ...r })));
      };
    });
  } catch (error) {
    console.error('Failed to get products from IndexedDB:', error);
    return [];
  }
}
