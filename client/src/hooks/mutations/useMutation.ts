import { useCallback, useEffect, useRef, useState } from 'react';
import type { APIResponse } from '../../types';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type MutationState<T> =
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

interface MutationOption<T, K extends JsonValue> {
  mutationFn: (mutationKey: K) => Promise<APIResponse<T>>;
  onSuccess?: (data: T) => Promise<void> | void;
  onFail?: (fail: Record<string, string>) => Promise<void> | void;
  onError?: (error: Error) => Promise<void> | void;
}

export default function useMutation<T, K extends JsonValue>(option: MutationOption<T, K>) {
  const [state, setState] = useState<MutationState<T>>({
    status: 'idle',
    data: null,
    fail: null,
    error: null,
  });
  const latestOption = useRef(option);
  const isMounted = useRef<boolean>(null);

  useEffect(() => {
    latestOption.current = option;
  }, [option]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      data: null,
      fail: null,
      error: null,
    });
  }, []);

  const mutateAsync = useCallback(async (mutationKey: K) => {
    if (isMounted.current) {
      setState({
        status: 'loading',
        data: null,
        fail: null,
        error: null,
      });
    }

    try {
      const response = await latestOption.current.mutationFn(mutationKey);

      if (isMounted.current && response.status === 'success') {
        setState({
          status: 'success',
          data: response.data,
          fail: null,
          error: null,
        });
      }

      if (isMounted.current && response.status === 'fail') {
        setState({
          status: 'fail',
          data: null,
          fail: response.data,
          error: null,
        });
      }

      if (isMounted.current && response.status === 'error') {
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

      if (isMounted.current) {
        setState({
          status: 'error',
          data: null,
          fail: null,
          error,
        });
      }

      throw error;
    }
  }, []);

  const mutate = useCallback(
    async (mutationKey: K) => {
      try {
        const response = await mutateAsync(mutationKey);

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
    },
    [mutateAsync],
  );

  return {
    ...state,
    mutate,
    mutateAsync,
    reset,
  };
}
