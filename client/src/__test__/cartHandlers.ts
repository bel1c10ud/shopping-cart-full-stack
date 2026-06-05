import { http, HttpResponse } from 'msw';
import type { CartItem } from '../types';

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

export const updateCartQuantityHandler = (
  cartItems: CartItem[],
  onChange?: (cartItems: CartItem[]) => void,
  onRequest?: (cartItemId: string) => void,
) => {
  return http.patch(`${CART_API_URL}/:cartItemId`, async ({ request, params }) => {
    const cartItemId = String(params.cartItemId);
    const body = (await request.json()) as { quantity: number };

    onRequest?.(cartItemId);

    const item = cartItems.find((i) => i.cartItemId === cartItemId);
    if (item) {
      item.quantity = body.quantity;
    }

    onChange?.(cartItems);

    return cartResponse(item);
  });
};

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
