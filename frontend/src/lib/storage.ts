import type { StateStorage } from 'zustand/middleware';

/**
 * localStorage that never throws. Private browsing, blocked site data or a full quota make
 * localStorage throw; then everything carries on in memory for the rest of the visit.
 */
const memory = new Map<string, string>();

function localStorageWorks() {
  try {
    const key = '__stepup_probe__';
    window.localStorage.setItem(key, key);
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

let persistent = typeof window !== 'undefined' && localStorageWorks();

export const safeStorage: StateStorage = {
  getItem(name) {
    if (persistent) {
      try {
        return window.localStorage.getItem(name);
      } catch {
        persistent = false;
      }
    }
    return memory.get(name) ?? null;
  },
  setItem(name, value) {
    memory.set(name, value);
    if (!persistent) return;
    try {
      window.localStorage.setItem(name, value);
    } catch {
      persistent = false; // quota or access error: keep going in memory
    }
  },
  removeItem(name) {
    memory.delete(name);
    if (!persistent) return;
    try {
      window.localStorage.removeItem(name);
    } catch {
      persistent = false;
    }
  },
};

/** Small string read/write helpers for preferences outside the stores. */
export const readPref = (name: string) => safeStorage.getItem(name) as string | null;
export const writePref = (name: string, value: string) => {
  void safeStorage.setItem(name, value);
};
