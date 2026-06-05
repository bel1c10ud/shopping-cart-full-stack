import { useMemo } from 'react';
import type { CartItem } from '../types';

export const SHIPPING_FEE = 3_000;

export const FREE_SHIPPING_THRESHOLD = 100_000;

export default function useCalculateCartAmount(cartItems: CartItem[]) {
  const orderAmount = useMemo(() => {
    return cartItems.reduce((prev, cur) => prev + cur.quantity * cur.product.price, 0);
  }, [cartItems]);

  const shippingAmount = useMemo(() => {
    return !cartItems.length || orderAmount > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  }, [cartItems.length, orderAmount]);

  const totalAmount = useMemo(() => {
    return orderAmount + shippingAmount;
  }, [orderAmount, shippingAmount]);

  return {
    orderAmount,
    shippingAmount,
    totalAmount,
  };
}
