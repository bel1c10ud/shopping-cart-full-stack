import { CartItemProductMissingError } from '../errors';
import { CartItem, CartItemWithProduct, Product } from '../types';

export function toCartItemWithProduct(cartItem: CartItem, product: Product): CartItemWithProduct {
  return {
    cartItemId: cartItem.cartItemId,
    quantity: cartItem.quantity,
    isSelected: cartItem.isSelected,
    product,
  };
}

export function toCartItemsWithProducts(cartItems: CartItem[], products: Product[]): CartItemWithProduct[] {
  return cartItems.map((cartItem) => {
    const product = products.find((product) => product.productId === cartItem.productId);

    if (!product) throw new CartItemProductMissingError(cartItem.cartItemId, cartItem.productId);

    return toCartItemWithProduct(cartItem, product);
  });
}
