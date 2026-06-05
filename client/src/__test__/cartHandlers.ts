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

    const updatedCartItems = cartItems.map((item) =>
      item.cartItemId === cartItemId ? { ...item, quantity: body.quantity } : item,
    );

    onChange?.(updatedCartItems);

    const updatedItem = updatedCartItems.find((item) => item.cartItemId === cartItemId);

    return cartResponse(updatedItem);
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

    onChange?.(cartItems.filter((item) => item.cartItemId !== cartItemId));

    return cartResponse({ cartItemId });
  });
};

export const deleteCartItemErrorHandler = () => {
  return http.delete(`${CART_API_URL}/:cartItemId`, () => {
    return new HttpResponse(null, { status: 400 });
  });
};
