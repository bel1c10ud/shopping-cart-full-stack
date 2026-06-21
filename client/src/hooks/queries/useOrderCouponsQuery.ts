import type { APIResponse, OrderCoupon } from '../../types';
import useQuery from './useQuery';

const isAPIResponse = <T>(value: unknown): value is APIResponse<T> => {
  if (typeof value !== 'object' || value === null || !('status' in value)) return false;

  if (value.status === 'success') return 'data' in value;
  if (value.status === 'fail') return 'data' in value;
  if (value.status === 'error') return 'message' in value;

  return false;
};

export default function useOrderCouponsQuery(orderId: string) {
  return useQuery({
    queryKey: ['GET', `${import.meta.env.VITE_API_URL}/order/${orderId}/coupons`],
    queryFn: async ([method, url]) => {
      const res = await fetch(url, { method });
      const text = await res.text();

      if (!text.trim()) throw new Error('Response error: empty response');

      const response = JSON.parse(text) as unknown;

      if (!isAPIResponse<OrderCoupon[]>(response)) {
        throw new Error('Response error: invalid response');
      }

      return response;
    },
  });
}
