import { OrderNotFoundError, ProductNotFoundError } from '../errors';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../constants';
import { Order, OrderWithProduct, OrdersRepository, OrdersServicePort, ProductsRepository } from '../types';

class OrdersService implements OrdersServicePort {
  private readonly ordersRepository;
  private readonly productsRepository;

  constructor({
    ordersRepository,
    productsRepository,
  }: {
    ordersRepository: OrdersRepository;
    productsRepository: ProductsRepository;
  }) {
    this.ordersRepository = ordersRepository;
    this.productsRepository = productsRepository;
  }

  async getOrderById(orderId: Order['orderId']) {
    const order = await this.ordersRepository.getById(orderId);
    const products = await this.productsRepository.getAll();

    if (!order) throw new OrderNotFoundError(orderId);

    const items = order.items.map((item) => {
      const product = products.find((el) => el.productId === item.productId);

      if (!product) throw new ProductNotFoundError(item.productId);

      return { product, quantity: item.quantity };
    });

    return {
      ...order,
      items,
      amount: this.calculateAmount(items),
    };
  }

  private calculateAmount(items: OrderWithProduct['items']) {
    const orderAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shippingAmount = orderAmount === 0 || orderAmount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const discountAmount = 0;
    const totalAmount = orderAmount + shippingAmount - discountAmount;

    return { orderAmount, shippingAmount, discountAmount, totalAmount };
  }
}

export default OrdersService;
