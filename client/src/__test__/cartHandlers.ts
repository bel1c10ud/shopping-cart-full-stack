import { http, HttpResponse } from 'msw';
import type { AmountSummary, CartItem } from '../types';

const CART_API_URL = `${import.meta.env.VITE_API_URL}/cart`;

const cartResponse = (data: unknown) => {
  return HttpResponse.json({
    status: 'success',
    data,
  });
};

export const getCartHandler = (cartItems: CartItem[], onRequest?: () => void) => {
  return http.get(CART_API_URL, () => {
    onRequest?.();

    return cartResponse(cartItems);
  });
};

export const getCartAmountHandler = (amount: AmountSummary, onRequest?: () => void) => {
  return http.get(`${CART_API_URL}/amount`, () => {
    onRequest?.();

    return cartResponse(amount);
  });
};

export const calculateCartAmount = (cartItems: CartItem[]): AmountSummary => {
  const selectedItems = cartItems.filter((item) => item.isSelected);
  const orderAmount = selectedItems.reduce((prev, cur) => prev + cur.quantity * cur.product.price, 0);
  const shippingAmount = !selectedItems.length || orderAmount >= 100_000 ? 0 : 3_000;

  return {
    orderAmount,
    shippingAmount,
    discountAmount: 0,
    totalAmount: orderAmount + shippingAmount,
  };
};

export const updateCartItemHandler = (
  cartItems: CartItem[],
  onChange?: (cartItems: CartItem[]) => void,
  onRequest?: (cartItemId: string, body: { quantity?: number; isSelected?: boolean }) => void,
) => {
  return http.patch(`${CART_API_URL}/:cartItemId`, async ({ request, params }) => {
    const cartItemId = String(params.cartItemId);
    const body = (await request.json()) as { quantity?: number; isSelected?: boolean };

    onRequest?.(cartItemId, body);

    const item = cartItems.find((i) => i.cartItemId === cartItemId);
    if (item) {
      if (body.quantity !== undefined) item.quantity = body.quantity;
      if (body.isSelected !== undefined) item.isSelected = body.isSelected;
    }

    onChange?.(cartItems);

    return cartResponse(item);
  });
};

export const updateCartQuantityHandler = updateCartItemHandler;

export const updateCartQuantityErrorHandler = (cartItemId: string) => {
  return http.patch(`${CART_API_URL}/${cartItemId}`, () => {
    return new HttpResponse(null, { status: 400 });
  });
};

export const deleteCartItemHandler = (
  cartItems: CartItem[],
  onChange?: (cartItems: CartItem[]) => void,
  onRequest?: (cartItemId: string) => void,
) => {
  return http.delete(`${CART_API_URL}/:cartItemId`, ({ params }) => {
    const cartItemId = String(params.cartItemId);

    onRequest?.(cartItemId);

    const index = cartItems.findIndex((i) => i.cartItemId === cartItemId);
    if (index !== -1) {
      cartItems.splice(index, 1);
    }

    onChange?.(cartItems);

    return cartResponse({ cartItemId });
  });
};

export const deleteCartItemErrorHandler = () => {
  return http.delete(`${CART_API_URL}/:cartItemId`, () => {
    return new HttpResponse(null, { status: 400 });
  });
};
