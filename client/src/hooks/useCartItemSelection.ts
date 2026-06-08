import { useCallback, useEffect } from 'react';
import type { CartItem } from '../types';
import { useLocalStorage } from './useLocalStorage';

export const CART_SELECT_LOCAL_STORAGE_KEY = 'woowacourse-mission-cart-select';

const isSameSelection = (a: Record<string, boolean>, b: Record<string, boolean>) => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  return aKeys.length === bKeys.length && aKeys.every((key) => a[key] === b[key]);
};

export default function useCartItemSelection(cartItems?: CartItem[]) {
  const { storage: selectedById, setStorage } = useLocalStorage<Record<string, boolean>>(
    CART_SELECT_LOCAL_STORAGE_KEY,
    {},
  );

  const setSelected = useCallback(
    (cartItemId: CartItem['cartItemId'], checked: boolean) => {
      setStorage((prev) => ({ ...prev, [cartItemId]: checked }));
    },
    [setStorage],
  );

  const setAllSelected = useCallback(
    (value: boolean) => {
      if (cartItems === undefined) return;
      setStorage(Object.fromEntries(cartItems.map((item) => [item.cartItemId, value])));
    },
    [cartItems, setStorage],
  );

  useEffect(() => {
    if (cartItems !== undefined) {
      const nextSelectedById = Object.fromEntries(
        cartItems.map((item) => [item.cartItemId, selectedById?.[item.cartItemId] ?? true]),
      );
      if (!isSameSelection(selectedById, nextSelectedById)) {
        setStorage(nextSelectedById);
      }
    }
  }, [cartItems, setStorage, selectedById]);

  return { selectedById, setSelected, setAllSelected };
}
