import type { CartItem } from '../../types';
import { isAPIResponse } from '../../utils';
import useQuery from './useQuery';

interface CartItemsQueryOption {
  staleTime?: number;
  onSuccess?: (data: CartItem[]) => Promise<void> | void;
  onFail?: (fail: Record<string, string>) => Promise<void> | void;
  onError?: (error: Error) => Promise<void> | void;
}

export default function useCartItemsQuery(option?: CartItemsQueryOption) {
  return useQuery({
    queryKey: ['GET', `${import.meta.env.VITE_API_URL}/cart`],
    staleTime: option?.staleTime,
    queryFn: async ([method, url]) => {
      const res = await fetch(url, { method });
      const text = await res.text();

      if (!text.trim()) throw new Error('Response error: empty response');

      const response = JSON.parse(text) as unknown;

      if (!isAPIResponse<CartItem[]>(response)) {
        throw new Error('Response error: invalid response');
      }

      return response;
    },
    onSuccess: option?.onSuccess,
    onFail: option?.onFail,
    onError: option?.onError,
  });
}
