/**
 * In-memory Web Storage polyfill for the jsdom test environment.
 *
 * Must be imported before any zustand store module: zustand's
 * `createJSONStorage(() => localStorage)` resolves storage once at module
 * evaluation time, so the globals have to exist before store imports run.
 */

const createMemoryStorage = (): Storage => {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) =>
      data.has(key) ? (data.get(key) as string) : null,
    setItem: (key: string, value: string) => {
      data.set(key, String(value));
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
    clear: () => {
      data.clear();
    },
    get length() {
      return data.size;
    },
    key: (index: number) => [...data.keys()][index] ?? null,
  };
};

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: createMemoryStorage(),
    configurable: true,
    writable: true,
  });
}

if (typeof globalThis.sessionStorage === 'undefined') {
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: createMemoryStorage(),
    configurable: true,
    writable: true,
  });
}

export {};
