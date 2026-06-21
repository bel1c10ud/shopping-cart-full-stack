import type { APIResponse, OrderWithProduct } from '../../types';
import useOrderQuery from '../queries/useOrderQuery';
import useMutation from './useMutation';

export type UpdateOrderRequest = {
  isRemoteArea?: boolean;
  couponIds?: string[];
};

interface UpdateOrderMutationOption {
  onSuccess?: (data: OrderWithProduct) => Promise<void> | void;
  onFail?: (fail: Record<string, string>) => Promise<void> | void;
  onError?: (error: Error) => Promise<void> | void;
}

export default function useUpdateOrderMutation(orderId: string, option?: UpdateOrderMutationOption) {
  const orderQuery = useOrderQuery(orderId);

  return useMutation<OrderWithProduct, UpdateOrderRequest>({
    mutationFn: async (body) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/order/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const text = await res.text();

      if (text.trim().length === 0) throw new Error(`Response error: ${res.status}`);

      return JSON.parse(text) as APIResponse<OrderWithProduct>;
    },
    onSettled: async () => {
      await orderQuery.refetch();
    },
    onSuccess: option?.onSuccess,
    onFail: option?.onFail,
    onError: option?.onError,
  });
}
