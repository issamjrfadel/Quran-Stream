import { DownloadedSurah, Reciter } from '../types';
import { getSurahAudioUrl } from '../data/quranData';

const DB_NAME = 'quran_audio_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'surah_audio_store';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' }); // key e.g. "alafasy_001"
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function makeKey(surahId: number, reciterId: string): string {
  return `${reciterId}_${surahId.toString().padStart(3, '0')}`;
}

// Download MP3 and cache in IndexedDB with progress callback
export async function downloadAndCacheSurah(
  surahId: number,
  reciter: Reciter,
  onProgress?: (percent: number) => void
): Promise<string> {
  const audioUrl = getSurahAudioUrl(surahId, reciter);
  const response = await fetch(audioUrl);
  if (!response.ok) {
    throw new Error(`Failed to download audio for Surah ${surahId}`);
  }

  const contentLength = response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  let loaded = 0;

  const reader = response.body?.getReader();
  const chunks: Uint8Array[] = [];

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        loaded += value.length;
        if (total > 0 && onProgress) {
          onProgress(Math.min(100, Math.round((loaded / total) * 100)));
        }
      }
    }
  }

  const blob = new Blob(chunks, { type: 'audio/mp3' });
  const key = makeKey(surahId, reciter.id);

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const record = {
      key,
      surahId,
      reciterId: reciter.id,
      downloadedAt: Date.now(),
      sizeBytes: blob.size,
      blob,
    };
    const req = store.put(record);
    req.onsuccess = () => {
      if (onProgress) onProgress(100);
      resolve(URL.createObjectURL(blob));
    };
    req.onerror = () => reject(req.error);
  });
}

// Check if Surah is downloaded and return Blob Object URL if present
export async function getOfflineSurahBlobUrl(surahId: number, reciterId: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const key = makeKey(surahId, reciterId);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(URL.createObjectURL(req.result.blob));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.error('IndexedDB read error:', err);
    return null;
  }
}

// Get all downloaded surahs metadata
export async function getAllDownloadedSurahs(): Promise<DownloadedSurah[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const results: DownloadedSurah[] = (req.result || []).map((item: any) => ({
          surahId: item.surahId,
          reciterId: item.reciterId,
          downloadedAt: item.downloadedAt,
          sizeBytes: item.sizeBytes,
        }));
        resolve(results);
      };
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    return [];
  }
}

// Delete downloaded Surah
export async function deleteDownloadedSurah(surahId: number, reciterId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const key = makeKey(surahId, reciterId);
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Delete all offline cache
export async function clearAllOfflineSurahs(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
