import type { AmountSummary, APIResponse } from '../../types';
import useQuery from './useQuery';

const isAPIResponse = <T>(value: unknown): value is APIResponse<T> => {
  if (typeof value !== 'object' || value === null || !('status' in value)) return false;

  if (value.status === 'success') return 'data' in value;
  if (value.status === 'fail') return 'data' in value;
  if (value.status === 'error') return 'message' in value;

  return false;
};

type CartAmountQueryKey = ['GET', string];

export const CART_AMOUNT_QUERY_KEY: CartAmountQueryKey = ['GET', `${import.meta.env.VITE_API_URL}/cart/amount`];

export async function fetchCartAmount([method, url]: CartAmountQueryKey) {
  const res = await fetch(url, { method });
  const text = await res.text();

  if (!text.trim()) throw new Error('Response error: empty response');

  const response = JSON.parse(text) as unknown;

  if (!isAPIResponse<AmountSummary>(response)) {
    throw new Error('Response error: invalid response');
  }

  return response;
}

export default function useCartAmountQuery() {
  return useQuery({
    queryKey: CART_AMOUNT_QUERY_KEY,
    queryFn: fetchCartAmount,
  });
}
