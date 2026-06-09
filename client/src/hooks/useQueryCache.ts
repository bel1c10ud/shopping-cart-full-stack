import { useSyncExternalStore } from 'react';

interface QueryState<T> {
  status: 'idle' | 'loading' | 'success' | 'fail' | 'error';
  data: T | null;
  fail: Record<string, string> | null;
  error: Error | null;
}

interface QueryCacheEntry<T> {
  state: QueryState<T>;
  updatedAt: number;
}

type QueryKey = string | number | boolean | null | readonly QueryKey[] | { [key: string]: QueryKey };
type QueryStateUpdater<T> = QueryState<T> | ((prev: QueryState<T> | undefined) => QueryState<T> | undefined);

export const isFreshCacheEntry = (entry: QueryCacheEntry<unknown> | undefined, staleTime: number, now = Date.now()) => {
  if (!entry) return false;
  if (entry.state.status !== 'success') return false;
  if (staleTime === Infinity) return true;

  return now - entry.updatedAt < staleTime;
};

let version = 0;

const cache = new Map<string, QueryCacheEntry<unknown>>();
const listeners = new Set<() => void>();

const hashQueryKey = (key: QueryKey) => JSON.stringify(key);

const notify = () => {
  version += 1;
  listeners.forEach((listener) => listener());
};

export const queryCache = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return version;
  },
  getEntry<T>(key: QueryKey) {
    return cache.get(hashQueryKey(key)) as QueryCacheEntry<T> | undefined;
  },
  get<T>(key: QueryKey) {
    return cache.get(hashQueryKey(key))?.state as QueryState<T> | undefined;
  },
  set<T>(key: QueryKey, updater: QueryStateUpdater<T>) {
    const queryKeyHash = hashQueryKey(key);
    const entry = cache.get(queryKeyHash) as QueryCacheEntry<T> | undefined;
    const nextState = typeof updater === 'function' ? updater(entry?.state) : updater;

    if (!nextState) return;

    cache.set(queryKeyHash, {
      state: nextState,
      updatedAt: Date.now(),
    });
    notify();
  },
  invalidate(key: QueryKey) {
    cache.delete(hashQueryKey(key));
    notify();
  },
  clear() {
    cache.clear();
    notify();
  },
};

export default function useQueryCache() {
  useSyncExternalStore(queryCache.subscribe, queryCache.getSnapshot);

  return {
    setCache: queryCache.set,
    getCache: queryCache.get,
    getCacheEntry: queryCache.getEntry,
    invalidateCache: queryCache.invalidate,
  };
}
