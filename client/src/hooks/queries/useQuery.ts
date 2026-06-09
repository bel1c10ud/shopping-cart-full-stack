import { useCallback, useEffect, useRef } from 'react';
import type { APIResponse } from '../../types';
import useQueryCache, { isFreshCacheEntry } from '../useQueryCache';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface QueryOption<T, K extends JsonValue> {
  queryKey: K;
  queryFn: (queryKey: K) => Promise<APIResponse<T>>;
  staleTime?: number;
  onSuccess?: (data: T) => Promise<void> | void;
  onFail?: (fail: Record<string, string>) => Promise<void> | void;
  onError?: (error: Error) => Promise<void> | void;
}

const idleState = {
  status: 'idle',
  data: null,
  fail: null,
  error: null,
} as const;

export default function useQuery<T, K extends JsonValue>(option: QueryOption<T, K>) {
  const latestOption = useRef(option);
  const queryKey = option.queryKey;
  const queryKeyHash = JSON.stringify(queryKey);
  const staleTime = option.staleTime ?? Infinity;

  const { setCache, getCache, getCacheEntry } = useQueryCache();

  const state = getCache<T>(queryKey) ?? idleState;

  useEffect(() => {
    latestOption.current = option;
  }, [option]);

  const refetchAsync = useCallback(async () => {
    const { queryKey } = latestOption.current;
    const currentState = getCache<T>(queryKey) ?? idleState;

    if (currentState.status === 'idle') {
      setCache(queryKey, {
        status: 'loading',
        data: null,
        fail: null,
        error: null,
      });
    }
    try {
      const { queryFn, queryKey } = latestOption.current;
      const response = await queryFn(queryKey);

      if (response.status === 'success') {
        setCache(queryKey, {
          status: 'success',
          data: response.data,
          fail: null,
          error: null,
        });
      }

      if (response.status === 'fail') {
        setCache(queryKey, {
          status: 'fail',
          data: null,
          fail: response.data,
          error: null,
        });
      }

      if (response.status === 'error') {
        setCache(queryKey, {
          status: 'error',
          data: null,
          fail: null,
          error: new Error(response.message),
        });
      }

      return response;
    } catch (reason) {
      const error = reason instanceof Error ? reason : new Error(String(reason));

      setCache(latestOption.current.queryKey, {
        status: 'error',
        data: null,
        fail: null,
        error,
      });

      throw error;
    }
  }, [getCache, setCache]);

  const refetch = useCallback(async () => {
    try {
      const response = await refetchAsync();

      if (response.status === 'success') {
        await latestOption.current.onSuccess?.(response.data);
      }

      if (response.status === 'fail') {
        await latestOption.current.onFail?.(response.data);
      }

      if (response.status === 'error') {
        await latestOption.current.onError?.(new Error(response.message));
      }

      return response;
    } catch (reason) {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      await latestOption.current.onError?.(error);
      return undefined;
    }
  }, [refetchAsync]);

  useEffect(() => {
    const cacheEntry = getCacheEntry<T>(latestOption.current.queryKey);

    if (isFreshCacheEntry(cacheEntry, staleTime)) return;

    refetch();
  }, [getCacheEntry, queryKeyHash, refetch, staleTime]);

  return {
    ...state,
    refetch,
    refetchAsync,
  };
}
