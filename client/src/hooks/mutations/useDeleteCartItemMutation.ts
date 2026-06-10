import type { APIResponse, CartItem } from '../../types';
import useCartItemsQuery from '../queries/useCartItemsQuery';
import useQueryCache from '../useQueryCache';
import useMutation from './useMutation';

interface DeleteCartItemMutationOption {
  onSuccess?: (data: Pick<CartItem, 'cartItemId'>) => Promise<void> | void;
  onFail?: (fail: Record<string, string>) => Promise<void> | void;
  onError?: (error: Error) => Promise<void> | void;
}

export default function useDeleteCartItemMutation(option?: DeleteCartItemMutationOption) {
  const cartItemsQuery = useCartItemsQuery();
  const { getCache, setCache } = useQueryCache();

  return useMutation<Pick<CartItem, 'cartItemId'>, CartItem['cartItemId']>({
    mutationFn: async (cartItemId) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/cart/${cartItemId}`, {
        method: 'DELETE',
      });

      const text = await res.text();

      if (text.trim().length === 0) throw new Error(`Response error: ${res.status}`);

      return JSON.parse(text) as APIResponse<Pick<CartItem, 'cartItemId'>>;
    },
    onMutate: (cartItemId) => {
      const previousCartItems = getCache<CartItem[]>(['GET', `${import.meta.env.VITE_API_URL}/cart`])?.data ?? [];

      setCache<CartItem[]>(['GET', `${import.meta.env.VITE_API_URL}/cart`], (prev) => {
        if (prev?.data === null || prev?.data === undefined) return prev;

        return {
          ...prev,
          data: prev.data.filter((item) => item.cartItemId !== cartItemId),
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
      await cartItemsQuery.refetch();
    },
    onSuccess: async (data) => {
      await option?.onSuccess?.(data);
    },
    onFail: option?.onFail,
    onError: option?.onError,
  });
}
