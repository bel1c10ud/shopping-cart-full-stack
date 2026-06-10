import { useCallback, useMemo, useSyncExternalStore } from 'react';

export function useLocalStorage<T>(key: string, fallback: T) {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener('storage', callback);
    window.addEventListener('local-storage-change', callback);

    return () => {
      window.removeEventListener('storage', callback);
      window.removeEventListener('local-storage-change', callback);
    };
  }, []);

  const getSnapshot = useCallback(() => {
    return window.localStorage.getItem(key);
  }, [key]);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot);

  const storage = useMemo(() => {
    if (snapshot === null) return fallback;

    try {
      return JSON.parse(snapshot) as T;
    } catch {
      return fallback;
    }
  }, [fallback, snapshot]);

  const setStorage = useCallback(
    (value: T | ((prev: T) => T)) => {
      const nextValue = typeof value === 'function' ? (value as (prev: T) => T)(storage) : value;

      const nextSnapshot = JSON.stringify(nextValue);

      window.localStorage.setItem(key, nextSnapshot);
      window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key, newValue: nextSnapshot } }));
    },
    [key, storage],
  );

  return {
    storage,
    setStorage,
  };
}
