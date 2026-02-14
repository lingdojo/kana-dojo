/**
 * Custom Wallpaper Store
 *
 * Manages custom wallpaper themes created by users from uploaded/linked images.
 *
 * Architecture:
 *   - Wallpaper **metadata** (name, dimensions, thumbnail data URL) is persisted
 *     in localStorage via Zustand so the UI can render instantly on page load.
 *   - Full-size **image blobs** are stored in IndexedDB (which supports large
 *     binary data without the ~5 MB localStorage limit).
 *   - At runtime, object URLs are created from IndexedDB blobs for use in CSS
 *     `background-image`. They are recreated on each page load and revoked on
 *     removal.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================================
// Types
// ============================================================================

export interface CustomWallpaperMeta {
  id: string;
  name: string;
  createdAt: number;
  originalSource: 'url' | 'file';
  originalName: string;
  width: number;
  height: number;
  sizeBytes: number;
  /** Small base64 data URL used for the theme card preview (fits in localStorage) */
  thumbnailDataUrl: string;
}

interface CustomWallpaperStore {
  wallpapers: CustomWallpaperMeta[];

  /** Runtime-only map: wallpaper ID → object URL created from IndexedDB blob */
  objectUrls: Record<string, string>;
  /** Whether IndexedDB blobs have been loaded into object URLs */
  initialized: boolean;

  // Actions
  addWallpaper: (meta: CustomWallpaperMeta, blob: Blob) => Promise<void>;
  removeWallpaper: (id: string) => Promise<void>;
  getWallpaperUrl: (id: string) => string | undefined;
  getThumbnailUrl: (id: string) => string | undefined;
  hasWallpaper: (id: string) => boolean;
  initializeObjectUrls: () => Promise<void>;
}

// ============================================================================
// IndexedDB helpers
// ============================================================================

const DB_NAME = 'kanadojo-custom-wallpapers';
const DB_VERSION = 1;
const STORE_NAME = 'images';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error('Failed to open IndexedDB: ' + request.error?.message));
  });
}

async function saveBlob(id: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(blob, id);
    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(new Error('Failed to save image: ' + request.error?.message));
    tx.oncomplete = () => db.close();
  });
}

async function loadBlob(id: string): Promise<Blob | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () =>
      reject(new Error('Failed to load image: ' + request.error?.message));
    tx.oncomplete = () => db.close();
  });
}

async function deleteBlob(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(new Error('Failed to delete image: ' + request.error?.message));
    tx.oncomplete = () => db.close();
  });
}

// ============================================================================
// Store
// ============================================================================

export const useCustomWallpaperStore = create<CustomWallpaperStore>()(
  persist(
    (set, get) => ({
      wallpapers: [],
      objectUrls: {},
      initialized: false,

      addWallpaper: async (meta, blob) => {
        // Save the full-size blob to IndexedDB
        await saveBlob(meta.id, blob);

        // Create an object URL for immediate CSS usage
        const objectUrl = URL.createObjectURL(blob);

        set(state => ({
          wallpapers: [...state.wallpapers, meta],
          objectUrls: { ...state.objectUrls, [meta.id]: objectUrl },
        }));
      },

      removeWallpaper: async id => {
        const { objectUrls } = get();

        // Revoke the object URL to free memory
        if (objectUrls[id]) {
          URL.revokeObjectURL(objectUrls[id]);
        }

        // Delete the blob from IndexedDB
        try {
          await deleteBlob(id);
        } catch (err) {
          console.warn('Failed to delete wallpaper blob from IndexedDB:', err);
        }

        set(state => {
          const newUrls = { ...state.objectUrls };
          delete newUrls[id];
          return {
            wallpapers: state.wallpapers.filter(w => w.id !== id),
            objectUrls: newUrls,
          };
        });
      },

      getWallpaperUrl: id => {
        return get().objectUrls[id];
      },

      getThumbnailUrl: id => {
        const wallpaper = get().wallpapers.find(w => w.id === id);
        return wallpaper?.thumbnailDataUrl;
      },

      hasWallpaper: id => {
        return get().wallpapers.some(w => w.id === id);
      },

      /**
       * Load all blobs from IndexedDB and create object URLs.
       * Called once on app startup. Wallpapers whose blobs are missing
       * (e.g. cleared browser storage) are silently removed from the list.
       */
      initializeObjectUrls: async () => {
        const { wallpapers, initialized } = get();
        if (initialized) return;

        const objectUrls: Record<string, string> = {};
        const validWallpapers: CustomWallpaperMeta[] = [];

        for (const wallpaper of wallpapers) {
          try {
            const blob = await loadBlob(wallpaper.id);
            if (blob) {
              objectUrls[wallpaper.id] = URL.createObjectURL(blob);
              validWallpapers.push(wallpaper);
            } else {
              console.warn(
                `Wallpaper blob not found for "${wallpaper.id}" — removing stale metadata.`,
              );
            }
          } catch (err) {
            console.warn(
              `Failed to load wallpaper blob for "${wallpaper.id}":`,
              err,
            );
          }
        }

        set({
          objectUrls,
          wallpapers: validWallpapers,
          initialized: true,
        });
      },
    }),
    {
      name: 'kanadojo-custom-wallpapers-meta',
      storage: createJSONStorage(() => localStorage),
      // Only persist wallpaper metadata (not runtime object URLs)
      partialize: state => ({
        wallpapers: state.wallpapers,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as
          | Partial<CustomWallpaperStore>
          | undefined;
        return {
          ...currentState,
          wallpapers: persisted?.wallpapers ?? [],
        };
      },
    },
  ),
);
