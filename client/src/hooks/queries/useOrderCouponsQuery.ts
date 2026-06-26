import type { OrderCoupon } from '../../types';
import { isAPIResponse } from '../../utils';
import useQuery from './useQuery';

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
