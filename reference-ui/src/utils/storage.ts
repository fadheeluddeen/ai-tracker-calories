// Durable IndexedDB storage engine for saving ingredients and high-res photos forever.

export interface PantryIngredient {
  id: string;
  name: string;
  photoUrl: string; // Base64 data URL or Object URL stored in IndexedDB
  category: 'produce' | 'protein' | 'dairy' | 'pantry' | 'grains' | 'other';
  quantity: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  dateAdded: string;
  expiryDays?: number;
  notes?: string;
}

const DB_NAME = 'ios_calorie_tracker_pantry_db';
const DB_VERSION = 1;
const STORE_NAME = 'ingredients_vault';

// Open or initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('dateAdded', 'dateAdded', { unique: false });
        store.createIndex('category', 'category', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Fallback to localStorage if IndexedDB is unavailable
const FALLBACK_KEY = 'ios_calorie_pantry_fallback';

function getFallbackIngredients(): PantryIngredient[] {
  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFallbackIngredients(items: PantryIngredient[]) {
  try {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('LocalStorage fallback quota reached:', err);
  }
}

// Get all ingredients permanently saved
export async function getAllIngredients(): Promise<PantryIngredient[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const result = (request.result as PantryIngredient[]) || [];
        // Sort newest first
        result.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('IndexedDB read failed, falling back to localStorage', e);
    return getFallbackIngredients();
  }
}

// Save or update ingredient with photo
export async function saveIngredient(item: PantryIngredient): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('IndexedDB write failed, falling back to localStorage', e);
    const existing = getFallbackIngredients();
    const index = existing.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      existing[index] = item;
    } else {
      existing.unshift(item);
    }
    saveFallbackIngredients(existing);
  }
}

// Delete an ingredient
export async function deleteIngredient(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    const existing = getFallbackIngredients().filter((i) => i.id !== id);
    saveFallbackIngredients(existing);
  }
}

// Helper: Compress and convert image file to Base64 (max 1000px dimension)
export function processImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const maxDim = 1000;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Output clean JPEG at 82% quality to maximize permanent storage efficiency
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for processing'));
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
  });
}

// Export all pantry data as a downloadable JSON file
export async function exportPantryBackup(): Promise<void> {
  const items = await getAllIngredients();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `ios-pantry-ingredients-backup-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Import pantry data from a JSON file
export async function importPantryBackup(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as PantryIngredient[];
        if (!Array.isArray(parsed)) throw new Error('Invalid format');
        for (const item of parsed) {
          if (item.id && item.name) {
            await saveIngredient(item);
          }
        }
        resolve(parsed.length);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
