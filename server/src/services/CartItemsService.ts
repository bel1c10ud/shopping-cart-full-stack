import { CartItem, CartItemsRepository, CartItemsServicePort, ProductsRepository } from '../types';
import {
  CartItemDeletionFailedError,
  CartItemNotFoundError,
  CartItemProductMissingError,
  ProductAlreadyInCartError,
  ProductNotFoundError,
} from '../errors';
import { InsertCartItemSchema, UpdateCartItemSchema } from '../schemas';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../constants';

class CartItemsService implements CartItemsServicePort {
  private readonly productsRepository;
  private readonly cartItemsRepository;

  constructor({
    productsRepository,
    cartItemsRepository,
  }: {
    productsRepository: ProductsRepository;
    cartItemsRepository: CartItemsRepository;
  }) {
    this.productsRepository = productsRepository;
    this.cartItemsRepository = cartItemsRepository;
  }

  async getCartItems() {
    const products = await this.productsRepository.getAll();
    const cartItems = await this.cartItemsRepository.getAll();

    return cartItems.map((item) => {
      const product = products.find((product) => product.productId === item.productId);

      if (!product) throw new CartItemProductMissingError(item.cartItemId, item.productId);

      return {
        cartItemId: item.cartItemId,
        quantity: item.quantity,
        isSelected: item.isSelected,
        product,
      };
    });
  }

  async getCartAmount() {
    const cartItems = await this.getCartItems();
    const selectedItems = cartItems.filter((item) => item.isSelected);

    const orderAmount = selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shippingAmount = orderAmount === 0 || orderAmount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const discountAmount = 0;
    const totalAmount = orderAmount + shippingAmount - discountAmount;

    return { orderAmount, shippingAmount, discountAmount, totalAmount };
  }

  async insertCartItem(cartItem: { productId: CartItem['productId']; quantity: CartItem['quantity'] }) {
    const parsedCartItem = InsertCartItemSchema.parse(cartItem);

    const product = await this.productsRepository.getById(parsedCartItem.productId);

    if (!product) throw new ProductNotFoundError(parsedCartItem.productId);

    const cartItems = await this.cartItemsRepository.getAll();

    if (cartItems.find((item) => item.productId === product.productId)) {
      throw new ProductAlreadyInCartError(product.productId);
    }

    const inserted = await this.cartItemsRepository.insertByUser({
      ...parsedCartItem,
      isSelected: true,
    });

    return {
      cartItemId: inserted.cartItemId,
      quantity: inserted.quantity,
      isSelected: inserted.isSelected,
      product,
    };
  }

  async patchCartItem(
    cartItemId: CartItem['cartItemId'],
    cartItemPartial: Partial<Omit<CartItem, 'productId' | 'cartItemId'>>,
  ) {
    const parsedCartItemPartial = UpdateCartItemSchema.parse(cartItemPartial);

    const cartItem = await this.cartItemsRepository.getById(cartItemId);

    if (!cartItem) throw new CartItemNotFoundError(cartItemId);

    const product = await this.productsRepository.getById(cartItem.productId);

    if (!product) throw new CartItemProductMissingError(cartItem.cartItemId, cartItem.productId);

    const newCartItem = {
      ...cartItem,
      ...parsedCartItemPartial,
    };

    await this.cartItemsRepository.updateById(cartItemId, newCartItem);

    return {
      cartItemId: newCartItem.cartItemId,
      quantity: newCartItem.quantity,
      isSelected: newCartItem.isSelected,
      product,
    };
  }

  async deleteCartItem(cartItemId: CartItem['cartItemId']) {
    const cartItem = await this.cartItemsRepository.getById(cartItemId);

    if (!cartItem) throw new CartItemNotFoundError(cartItemId);

    const deleted = await this.cartItemsRepository.deleteById(cartItemId);

    if (!deleted) throw new CartItemDeletionFailedError(cartItemId);

    return deleted;
  }
}

export default CartItemsService;
