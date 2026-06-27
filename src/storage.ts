/**
 * Persistent storage layer using IndexedDB (via idb-keyval).
 * Replaces localStorage which is blocked in Perchance sandboxed iframes.
 *
 * Uses separate stores for different data categories:
 *   - "config"  → API keys, settings, preferences
 *   - "history" → conversation history, message cache
 *   - "state"   → agent runtime state (flags, counters, etc.)
 */

import { createStore, get, set, del, update, clear, keys, entries } from "idb-keyval";

// ─── Named Stores ───────────────────────────────────────────
const configStore = createStore("agent-config", "config");
const historyStore = createStore("agent-history", "messages");
const stateStore = createStore("agent-state", "runtime");

export type StoreName = "config" | "history" | "state";

function getStore(name: StoreName) {
  switch (name) {
    case "config": return configStore;
    case "history": return historyStore;
    case "state": return stateStore;
  }
}

// ─── Generic API ────────────────────────────────────────────
export async function storageGet<T = unknown>(key: string, store: StoreName = "config"): Promise<T | undefined> {
  try {
    return await get<T>(key, getStore(store));
  } catch (e) {
    console.warn(`[Storage] get("${key}") failed:`, e);
    return undefined;
  }
}

export async function storageSet<T = unknown>(key: string, value: T, store: StoreName = "config"): Promise<void> {
  try {
    await set(key, value, getStore(store));
  } catch (e) {
    console.warn(`[Storage] set("${key}") failed:`, e);
  }
}

export async function storageDel(key: string, store: StoreName = "config"): Promise<void> {
  try {
    await del(key, getStore(store));
  } catch (e) {
    console.warn(`[Storage] del("${key}") failed:`, e);
  }
}

export async function storageUpdate<T = unknown>(key: string, fn: (prev: T | undefined) => T, store: StoreName = "config"): Promise<void> {
  try {
    await update(key, fn, getStore(store));
  } catch (e) {
    console.warn(`[Storage] update("${key}") failed:`, e);
  }
}

export async function storageClear(store: StoreName = "config"): Promise<void> {
  try {
    await clear(getStore(store));
  } catch (e) {
    console.warn(`[Storage] clear() failed:`, e);
  }
}

export async function storageKeys(store: StoreName = "config"): Promise<IDBValidKey[]> {
  try {
    return await keys(getStore(store));
  } catch (e) {
    console.warn(`[Storage] keys() failed:`, e);
    return [];
  }
}

export async function storageEntries<T = unknown>(store: StoreName = "config"): Promise<[IDBValidKey, T][]> {
  try {
    return await entries<T>(getStore(store));
  } catch (e) {
    console.warn(`[Storage] entries() failed:`, e);
    return [];
  }
}
