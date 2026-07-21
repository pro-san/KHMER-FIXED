import { DownloadedItem } from '../types';

const DB_NAME = 'AuraOfflineDB';
const DB_VERSION = 1;
const STORE_MEDIA = 'offline_media';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_MEDIA)) {
        const store = db.createObjectStore(STORE_MEDIA, { keyPath: 'id' });
        store.createIndex('mediaId', 'mediaId', { unique: false });
        store.createIndex('mediaType', 'mediaType', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDownloadedMedia(item: DownloadedItem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MEDIA, 'readwrite');
    const store = tx.objectStore(STORE_MEDIA);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllDownloadedMedia(): Promise<DownloadedItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MEDIA, 'readonly');
    const store = tx.objectStore(STORE_MEDIA);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getDownloadedMediaByMediaId(mediaId: string): Promise<DownloadedItem | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MEDIA, 'readonly');
    const store = tx.objectStore(STORE_MEDIA);
    const index = store.index('mediaId');
    const request = index.get(mediaId);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteDownloadedMedia(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MEDIA, 'readwrite');
    const store = tx.objectStore(STORE_MEDIA);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllOfflineMedia(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MEDIA, 'readwrite');
    const store = tx.objectStore(STORE_MEDIA);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getStorageStats(): Promise<{ usageMb: number; quotaMb: number }> {
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const usageMb = (estimate.usage || 0) / (1024 * 1024);
      const quotaMb = (estimate.quota || 0) / (1024 * 1024);
      return { usageMb: Math.round(usageMb * 10) / 10, quotaMb: Math.round(quotaMb) };
    }
  } catch (e) {
    console.warn('Storage estimation not available:', e);
  }
  // Fallback calculation from downloaded media
  const media = await getAllDownloadedMedia();
  const totalMb = media.reduce((acc, m) => acc + (m.blob ? m.blob.size / (1024 * 1024) : m.fileSizeMb), 0);
  return { usageMb: Math.round(totalMb * 10) / 10, quotaMb: 15360 }; // 15 GB default
}
