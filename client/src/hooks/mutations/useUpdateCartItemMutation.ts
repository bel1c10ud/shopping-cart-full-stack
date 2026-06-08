import type { APIResponse, CartItem } from '../../types';
import useMutation from './useMutation';

interface UpdateCartItemMutationOption {
  onSuccess?: (data: CartItem) => Promise<void> | void;
  onFail?: (fail: Record<string, string>) => Promise<void> | void;
  onError?: (error: Error) => Promise<void> | void;
}

export default function useUpdateCartItemMutation(option?: UpdateCartItemMutationOption) {
  return useMutation<CartItem, Pick<CartItem, 'cartItemId' | 'quantity'>>({
    mutationFn: async (cartItem) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/cart/${cartItem.cartItemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: cartItem.quantity,
        }),
      });

      const text = await res.text();

      if (text.trim().length === 0) throw new Error(`Response error: ${res.status}`);

      return JSON.parse(text) as APIResponse<CartItem>;
    },
    onSuccess: option?.onSuccess,
    onFail: option?.onFail,
    onError: option?.onError,
  });
}
