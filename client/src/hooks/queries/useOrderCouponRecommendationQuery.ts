import type { CouponRecommendation } from '../../types';
import { isAPIResponse } from '../../utils';
import useQuery from './useQuery';

export default function useOrderCouponRecommendationQuery(orderId: string) {
  return useQuery({
    queryKey: ['GET', `${import.meta.env.VITE_API_URL}/order/${orderId}/coupon-recommendation`],
    queryFn: async ([method, url]) => {
      const res = await fetch(url, { method });
      const text = await res.text();

      if (!text.trim()) throw new Error('Response error: empty response');

      const response = JSON.parse(text) as unknown;

      if (!isAPIResponse<CouponRecommendation>(response)) {
        throw new Error('Response error: invalid response');
      }

      return response;
    },
  });
}
