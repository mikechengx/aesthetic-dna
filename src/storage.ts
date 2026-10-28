import { upgradeSession, type Session } from './core.ts';
const KEY = 'aesthetic-dna-v1';
const RECOVERY = KEY + '-recovery';
export function backup(s: Session) {
  try {
    localStorage.setItem(RECOVERY, JSON.stringify(s));
  } catch {
    /* IndexedDB remains the main store if recovery storage is unavailable. */
  }
}
const valid = (s: Session | null): s is Session =>
  !!s &&
  s.version === 1 &&
  !!s.answers &&
  Array.isArray(s.flips) &&
  s.flips.length === 16 &&
  Number.isInteger(s.step) &&
  s.step >= 0 &&
  s.step < 16;
function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(KEY, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('data');
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
export async function load(): Promise<Session | null> {
  try {
    const s = JSON.parse(localStorage.getItem(RECOVERY) ?? 'null');
    if (valid(s)) return upgradeSession(s);
  } catch {
    /* Fall back to the main store. */
  }
  const d = await db();
  try {
    return await new Promise((resolve, reject) => {
      const r = d.transaction('data').objectStore('data').get('session');
      r.onsuccess = () => resolve(valid(r.result) ? upgradeSession(r.result) : null);
      r.onerror = () => reject(r.error);
    });
  } finally {
    d.close();
  }
}
export async function save(s: Session): Promise<void> {
  const d = await db();
  try {
    await new Promise<void>((resolve, reject) => {
      const t = d.transaction('data', 'readwrite');
      t.objectStore('data').put(s, 'session');
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  } finally {
    d.close();
  }
}
export async function clear(): Promise<void> {
  const d = await db();
  try {
    await new Promise<void>((resolve, reject) => {
      const t = d.transaction('data', 'readwrite');
      t.objectStore('data').delete('session');
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
    });
    localStorage.removeItem(RECOVERY);
  } finally {
    d.close();
  }
}
