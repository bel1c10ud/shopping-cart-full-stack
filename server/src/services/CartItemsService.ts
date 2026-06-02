import {
  CartItem,
  CartItemsRepository,
  CartItemsServicePort,
  ProductsRepository,
} from '../types';
import {
  CartItemDeletionFailedError,
  CartItemNotFoundError,
  CartItemProductMissingError,
  ProductAlreadyInCartError,
  ProductNotFoundError,
} from '../errors';
import { CartItemSchema } from '../schemas';

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
        product,
      };
    });
  }

  async insertCartItem(cartItem: {
    productId: CartItem['productId'];
    quantity: CartItem['quantity'];
  }) {
    const parsedCartItem = CartItemSchema.parse(cartItem);

    const product = await this.productsRepository.getById(parsedCartItem.productId);

    if (!product) throw new ProductNotFoundError(parsedCartItem.productId);

    const cartItems = await this.cartItemsRepository.getAll();

    if (cartItems.find((item) => item.productId === product.productId)) {
      throw new ProductAlreadyInCartError(product.productId);
    }

    const inserted = await this.cartItemsRepository.insertByUser(parsedCartItem);

    return {
      cartItemId: inserted.cartItemId,
      quantity: inserted.quantity,
      product,
    };
  }

  async patchCartItem(
    cartItemId: CartItem['cartItemId'],
    cartItemPartial: { quantity: CartItem['quantity'] },
  ) {
    const parsedCartItemPartial = CartItemSchema.pick({ quantity: true }).parse(cartItemPartial);

    const cartItem = await this.cartItemsRepository.getById(cartItemId);

    if (!cartItem) throw new CartItemNotFoundError(cartItemId);

    const product = await this.productsRepository.getById(cartItem.productId);

    if (!product) throw new CartItemProductMissingError(cartItem.cartItemId, cartItem.productId);

    const newCartItem = {
      ...cartItem,
      quantity: parsedCartItemPartial.quantity,
    };

    await this.cartItemsRepository.updateById(cartItemId, newCartItem);

    return {
      cartItemId: newCartItem.cartItemId,
      quantity: newCartItem.quantity,
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
