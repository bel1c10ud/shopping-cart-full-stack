import { useCallback, useEffect, useRef, useState } from 'react';
import type { APIResponse } from '../../types';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type QueryState<T> =
  | {
      status: 'idle' | 'loading';
      data: null;
      fail: null;
      error: null;
    }
  | {
      status: 'success';
      data: T;
      fail: null;
      error: null;
    }
  | {
      status: 'fail';
      data: null;
      fail: Record<string, string>;
      error: null;
    }
  | {
      status: 'error';
      data: null;
      fail: null;
      error: Error;
    };

interface QueryOption<T, K extends JsonValue> {
  queryKey: K;
  queryFn: (queryKey: K) => Promise<APIResponse<T>>;
  onSuccess?: (data: T) => Promise<void> | void;
  onFail?: (fail: Record<string, string>) => Promise<void> | void;
  onError?: (error: Error) => Promise<void> | void;
}

export default function useQuery<T, K extends JsonValue>(option: QueryOption<T, K>) {
  const [state, setState] = useState<QueryState<T>>({
    status: 'idle',
    data: null,
    fail: null,
    error: null,
  });
  const latestOption = useRef(option);
  const queryKeyHash = JSON.stringify(option.queryKey);

  useEffect(() => {
    latestOption.current = option;
  }, [option]);

  const refetchAsync = useCallback(async () => {
    setState((prev) => (prev.status === 'idle' ? { ...prev, status: 'loading' } : prev));

    try {
      const { queryFn, queryKey } = latestOption.current;
      const response = await queryFn(queryKey);

      if (response.status === 'success') {
        setState({
          status: 'success',
          data: response.data,
          fail: null,
          error: null,
        });
      }

      if (response.status === 'fail') {
        setState({
          status: 'fail',
          data: null,
          fail: response.data,
          error: null,
        });
      }

      if (response.status === 'error') {
        setState({
          status: 'error',
          data: null,
          fail: null,
          error: new Error(response.message),
        });
      }

      return response;
    } catch (reason) {
      const error = reason instanceof Error ? reason : new Error(String(reason));

      setState({
        status: 'error',
        data: null,
        fail: null,
        error,
      });

      throw error;
    }
  }, []);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch, queryKeyHash]);

  return {
    status: state.status,
    data: state.data,
    fail: state.fail,
    error: state.error,
    refetch,
    refetchAsync,
  };
}
