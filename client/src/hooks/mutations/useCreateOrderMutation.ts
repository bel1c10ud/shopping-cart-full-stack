import type { APIResponse, OrderItem, OrderWithProduct } from '../../types';
import useMutation from './useMutation';

interface CreateOrderMutationOption {
  onSuccess?: (data: OrderWithProduct) => Promise<void> | void;
  onFail?: (fail: Record<string, string>) => Promise<void> | void;
  onError?: (error: Error) => Promise<void> | void;
}

export default function useCreateOrderMutation(option?: CreateOrderMutationOption) {
  return useMutation<OrderWithProduct, OrderItem[]>({
    mutationFn: async (items) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      const text = await res.text();

      if (text.trim().length === 0) throw new Error(`Response error: ${res.status}`);

      return JSON.parse(text) as APIResponse<OrderWithProduct>;
    },
    onSuccess: option?.onSuccess,
    onFail: option?.onFail,
    onError: option?.onError,
  });
}
