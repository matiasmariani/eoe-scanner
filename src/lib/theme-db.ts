export type Theme = 'minecraft' | 'kitty';

const DB_NAME = 'snackbuddy';
const STORE_NAME = 'settings';
const THEME_KEY = 'app-theme';

let dbInstance: IDBDatabase | null = null;

async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    // Version 2: 'settings' and 'products' stores share this DB (see product-db.ts),
    // so both upgrade paths must create both stores.
    const request = indexedDB.open(DB_NAME, 2);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains('products')) {
        const store = db.createObjectStore('products', { keyPath: 'barcode' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

export async function getTheme(): Promise<Theme> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(THEME_KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as Theme | undefined;
        if (result) {
          resolve(result);
        } else {
          // Fall back to localStorage if IndexedDB is empty
          try {
            const stored = localStorage.getItem(THEME_KEY);
            resolve((stored as Theme) || 'minecraft');
          } catch (e) {
            resolve('minecraft');
          }
        }
      };
    });
  } catch (error) {
    console.error('Failed to get theme from IndexedDB:', error);
    // Fall back to localStorage
    try {
      const stored = localStorage.getItem(THEME_KEY);
      return (stored as Theme) || 'minecraft';
    } catch (e) {
      return 'minecraft';
    }
  }
}

export async function setTheme(theme: Theme): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(theme, THEME_KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        // Also sync to localStorage as fallback for pre-paint script
        try {
          localStorage.setItem(THEME_KEY, theme);
        } catch (e) {
          // localStorage might be unavailable in some contexts
        }
        resolve();
      };
    });
  } catch (error) {
    console.error('Failed to set theme in IndexedDB:', error);
  }
}
