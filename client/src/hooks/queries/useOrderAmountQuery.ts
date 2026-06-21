import type { AmountSummary, APIResponse } from '../../types';
import useQuery from './useQuery';

interface OrderAmountQueryParams {
  couponIds?: string[];
  isRemoteArea?: boolean;
}

const isAPIResponse = <T>(value: unknown): value is APIResponse<T> => {
  if (typeof value !== 'object' || value === null || !('status' in value)) return false;

  if (value.status === 'success') return 'data' in value;
  if (value.status === 'fail') return 'data' in value;
  if (value.status === 'error') return 'message' in value;

  return false;
};

export default function useOrderAmountQuery(orderId: string, params: OrderAmountQueryParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.couponIds !== undefined) {
    searchParams.set('couponIds', params.couponIds.join(','));
  }

  if (params.isRemoteArea !== undefined) {
    searchParams.set('isRemoteArea', String(params.isRemoteArea));
  }

  const queryString = searchParams.toString();
  const url = `${import.meta.env.VITE_API_URL}/order/${orderId}/amount${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: ['GET', url],
    queryFn: async ([method, url]) => {
      const res = await fetch(url, { method });
      const text = await res.text();

      if (!text.trim()) throw new Error('Response error: empty response');

      const response = JSON.parse(text) as unknown;

      if (!isAPIResponse<AmountSummary>(response)) {
        throw new Error('Response error: invalid response');
      }

      return response;
    },
  });
}
