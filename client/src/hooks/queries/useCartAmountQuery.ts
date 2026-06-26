import type { AmountSummary } from '../../types';
import { isAPIResponse } from '../../utils';
import useQuery from './useQuery';

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
