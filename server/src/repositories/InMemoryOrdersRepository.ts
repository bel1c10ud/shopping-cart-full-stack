import { Order, OrdersRepository } from '../types';

export const orders = new Map<string, Order>([
  [
    'od1',
    {
      orderId: 'od1',
      status: 'PENDING',
      isRemoteArea: false,
      items: [
        {
          productId: 'p1',
          quantity: 1,
        },
      ],
      couponIds: [],
    },
  ],
]);

class InMemoryProductsRepository implements OrdersRepository {
  store;

  constructor() {
    this.store = orders;
  }

  async getById(orderId: Order['orderId']) {
    return this.store.get(orderId);
  }
}

export default InMemoryProductsRepository;
