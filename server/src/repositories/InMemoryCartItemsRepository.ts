import { CartItem, CartItemsRepository } from './../types';

export const cartItems = new Map<string, CartItem>();

class InMemoryCartItemsRepository implements CartItemsRepository {
  store;

  constructor() {
    this.store = cartItems;
  }

  async getAll() {
    return Array.from(this.store.entries()).map((entry) => entry[1]);
  }

  async getById(cartItemId: CartItem['cartItemId']) {
    return this.store.get(cartItemId);
  }

  private generateUniqueId(): string {
    const id = crypto.randomUUID();

    return this.store.has(id) ? this.generateUniqueId() : id;
  }

  async insertByUser(cartItem: Omit<CartItem, 'cartItemId'>) {
    const cartItemObj = {
      cartItemId: this.generateUniqueId(),
      ...cartItem,
    };

    this.store.set(cartItemObj.cartItemId, cartItemObj);

    return cartItemObj;
  }

  async updateById(cartItemId: CartItem['cartItemId'], cartItem: CartItem) {
    this.store.set(cartItemId, cartItem);

    return this.store.get(cartItemId);
  }

  async deleteById(cartItemId: CartItem['cartItemId']) {
    const cartItem = this.store.get(cartItemId);

    if (!cartItem) return null;

    this.store.delete(cartItemId);

    return { cartItemId: cartItem.cartItemId };
  }
}

export default InMemoryCartItemsRepository;
