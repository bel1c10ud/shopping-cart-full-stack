import { useCallback, useEffect } from 'react';
import type { CartItem } from '../types';
import { useLocalStorage } from './useLocalStorage';

export const CART_SELECT_LOCAL_STORAGE_KEY = 'woowacourse-mission-cart-select';

export default function useCartItemSelection(cartItems?: CartItem[]) {
  const { storage: selectedById, setStorage } = useLocalStorage<Record<string, boolean>>(
    CART_SELECT_LOCAL_STORAGE_KEY,
    {},
  );

  const setSelected = useCallback(
    (cartItemId: CartItem['cartItemId'], value: boolean) => {
      setStorage((prev) => {
        const newStorage = { ...prev };
        newStorage[cartItemId] = value;
        return newStorage;
      });
    },
    [setStorage],
  );

  const setAllSelected = useCallback(
    (value: boolean) => {
      setStorage((prev) => {
        const newStorage = { ...prev };
        Object.keys(newStorage).forEach((key) => (newStorage[key] = value));
        return newStorage;
      });
    },
    [setStorage],
  );

  useEffect(() => {
    if (cartItems !== undefined)
      setStorage(
        Object.fromEntries(cartItems.map((item) => [item.cartItemId, selectedById?.[item.cartItemId] ?? true])),
      );
  }, [cartItems, setStorage, selectedById]);

  return { selectedById, setSelected, setAllSelected };
}
