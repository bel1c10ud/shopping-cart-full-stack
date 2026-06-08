import { startTransition, useOptimistic } from 'react';
import useDeleteCartItemMutation from './mutations/useDeleteCartItemMutation';
import useUpdateCartItemMutation from './mutations/useUpdateCartItemMutation';
import useCartItemsQuery from './queries/useCartItemsQuery';
import type { CartItem } from '../types';
import useCartItemSelection from './useCartItemSelection';

export default function useCartItems() {
  const cartItemsQuery = useCartItemsQuery({
    onFail: () => alert('장바구니를 가져오지 못했어요'),
    onError: () => alert('장바구니를 가져오지 못했어요'),
  });
  const cartItems = cartItemsQuery.data ?? [];

  const { selectedById, setSelected, setAllSelected } = useCartItemSelection(cartItemsQuery.data ?? undefined);

  const [optimisticCartItems, setOptimisticCartItems] = useOptimistic<CartItem[]>(cartItems);

  const updateCartItemQuantityMutation = useUpdateCartItemMutation({
    onFail: () => alert('장바구니 수량 변경에 실패했어요'),
    onError: () => alert('장바구니 수량 변경에 실패했어요'),
  });

  const deleteCartItemMutation = useDeleteCartItemMutation({
    onFail: () => alert('장바구니 삭제에 실패했어요'),
    onError: () => alert('장바구니 삭제에 실패했어요'),
  });

  const OptimisticUpdateCartItemQuantity = (cartItem: {
    cartItemId: CartItem['cartItemId'];
    quantity: CartItem['quantity'];
  }) => {
    startTransition(async () => {
      setOptimisticCartItems((oldCartItems) => {
        const newCartItems = [...oldCartItems];

        const itemIndex = newCartItems.findIndex((item) => item.cartItemId === cartItem.cartItemId);

        if (itemIndex !== -1) newCartItems[itemIndex] = { ...newCartItems[itemIndex], quantity: cartItem.quantity };

        return newCartItems;
      });

      await updateCartItemQuantityMutation.mutate(cartItem);
      await cartItemsQuery.refetch();
    });
  };

  const OptimisticDeleteCartItem = (cartItemId: CartItem['cartItemId']) => {
    startTransition(async () => {
      setOptimisticCartItems((oldCartItems) => {
        return oldCartItems.filter((item) => item.cartItemId !== cartItemId);
      });

      await deleteCartItemMutation.mutate(cartItemId);
      await cartItemsQuery.refetch();
    });
  };

  return {
    status: cartItemsQuery.status,
    error: cartItemsQuery.error,
    optimisticCartItems,
    OptimisticUpdateCartItemQuantity,
    OptimisticDeleteCartItem,
    selectedById,
    setSelected,
    setAllSelected,
  };
}
