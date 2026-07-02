/**
 * Tiny IndexedDB store for the pilot chat shells: keeps the LAST 20 MESSAGES
 * per conversation so an installed workspace app can render recent history
 * while offline (the tenant service worker serves the shell; this serves the
 * words). Text-only snapshots — citations/tool parts are not persisted.
 *
 * Browser-only. Every call no-ops (or falls back to localStorage) when
 * IndexedDB is unavailable, so it can never break the chat itself.
 */

export type StoredChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

export const CHAT_HISTORY_LIMIT = 20;

const DB_NAME = 'assembl-pilot-chat';
const STORE = 'conversations';
const LS_PREFIX = 'assembl-pilot-chat:';

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') return resolve(null);
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function loadChatHistory(key: string): Promise<StoredChatMessage[]> {
  const db = await openDb();
  if (db) {
    try {
      return await new Promise<StoredChatMessage[]>((resolve) => {
        const tx = db.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).get(key);
        req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
        req.onerror = () => resolve([]);
      });
    } catch {
      /* fall through to localStorage */
    }
  }
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    return raw ? (JSON.parse(raw) as StoredChatMessage[]) : [];
  } catch {
    return [];
  }
}

export async function saveChatHistory(key: string, messages: StoredChatMessage[]): Promise<void> {
  const trimmed = messages.slice(-CHAT_HISTORY_LIMIT);
  const db = await openDb();
  if (db) {
    try {
      await new Promise<void>((resolve) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(trimmed, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
      return;
    } catch {
      /* fall through */
    }
  }
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(trimmed));
  } catch {
    /* storage full / private mode — history just won't persist */
  }
}
