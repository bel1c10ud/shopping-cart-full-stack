import type { APIResponse, CartItem } from '../../types';
import { CART_AMOUNT_QUERY_KEY, fetchCartAmount } from '../queries/useCartAmountQuery';
import useCartItemsQuery from '../queries/useCartItemsQuery';
import useQueryCache from '../useQueryCache';
import useMutation from './useMutation';

interface UpdateCartItemMutationOption {
  onSuccess?: (data: CartItem) => Promise<void> | void;
  onFail?: (fail: Record<string, string>) => Promise<void> | void;
  onError?: (error: Error) => Promise<void> | void;
}

export default function useUpdateCartItemMutation(option?: UpdateCartItemMutationOption) {
  const cartItemsQuery = useCartItemsQuery();
  const { getCache, setCache } = useQueryCache();

  return useMutation<CartItem, Pick<CartItem, 'cartItemId'> & Partial<Pick<CartItem, 'quantity' | 'isSelected'>>>({
    mutationFn: async (cartItem) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/cart/${cartItem.cartItemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(getUpdateCartItemRequestBody(cartItem)),
      });

      const text = await res.text();

      if (text.trim().length === 0) throw new Error(`Response error: ${res.status}`);

      return JSON.parse(text) as APIResponse<CartItem>;
    },
    onMutate: (cartItem) => {
      const previousCartItems = getCache<CartItem[]>(['GET', `${import.meta.env.VITE_API_URL}/cart`])?.data ?? [];

      setCache<CartItem[]>(['GET', `${import.meta.env.VITE_API_URL}/cart`], (prev) => {
        if (prev?.data === null || prev?.data === undefined) return prev;

        const newCartItems = [...prev.data];
        const itemIndex = newCartItems.findIndex((item) => item.cartItemId === cartItem.cartItemId);

        if (itemIndex !== -1) {
          newCartItems[itemIndex] = {
            ...newCartItems[itemIndex],
            ...getUpdateCartItemRequestBody(cartItem),
          };
        }

        return {
          ...prev,
          data: newCartItems,
        };
      });

      return () => {
        setCache<CartItem[]>(['GET', `${import.meta.env.VITE_API_URL}/cart`], (prev) =>
          prev
            ? {
                ...prev,
                status: 'success',
                data: previousCartItems,
                fail: null,
                error: null,
              }
            : undefined,
        );
      };
    },
    onSettled: async () => {
      const [, cartAmountResponse] = await Promise.all([cartItemsQuery.refetch(), fetchCartAmount(CART_AMOUNT_QUERY_KEY)]);

      if (cartAmountResponse.status === 'success') {
        setCache(CART_AMOUNT_QUERY_KEY, {
          status: 'success',
          data: cartAmountResponse.data,
          fail: null,
          error: null,
        });
      }
    },
    onSuccess: async (data) => {
      await option?.onSuccess?.(data);
    },
    onFail: option?.onFail,
    onError: option?.onError,
  });
}

function getUpdateCartItemRequestBody(
  cartItem: Pick<CartItem, 'cartItemId'> & Partial<Pick<CartItem, 'quantity' | 'isSelected'>>,
) {
  return {
    ...(cartItem.quantity !== undefined && { quantity: cartItem.quantity }),
    ...(cartItem.isSelected !== undefined && { isSelected: cartItem.isSelected }),
  };
}
