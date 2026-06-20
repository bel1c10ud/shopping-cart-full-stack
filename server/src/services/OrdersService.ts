import { OrderNotFoundError, ProductNotFoundError } from '../errors';
import CouponValidator from '../domain/CouponValidator';
import OrderAmountCalculator from '../domain/OrderAmountCalculator';
import { toOrderItemsWithProducts } from '../mappers/orderMapper';
import {
  CouponsRepository,
  Order,
  OrderItem,
  OrdersRepository,
  OrdersServicePort,
  ProductsRepository,
} from '../types';

class OrdersService implements OrdersServicePort {
  private readonly ordersRepository;
  private readonly productsRepository;
  private readonly couponsRepository;
  private readonly couponValidator = new CouponValidator();
  private readonly orderAmountCalculator = new OrderAmountCalculator();

  constructor({
    ordersRepository,
    productsRepository,
    couponsRepository,
  }: {
    ordersRepository: OrdersRepository;
    productsRepository: ProductsRepository;
    couponsRepository: CouponsRepository;
  }) {
    this.ordersRepository = ordersRepository;
    this.productsRepository = productsRepository;
    this.couponsRepository = couponsRepository;
  }

  async getOrderById(orderId: Order['orderId']) {
    const order = await this.ordersRepository.getById(orderId);

    if (!order) throw new OrderNotFoundError(orderId);

    const products = await this.productsRepository.getAll();
    const coupons = await this.couponsRepository.getCoupons();
    const userCoupons = await this.couponsRepository.getUserCoupons();
    const items = toOrderItemsWithProducts(order, products);

    return {
      ...order,
      items,
      amount: this.orderAmountCalculator.calculate({
        order,
        products,
        issuedCoupons: userCoupons,
        coupons,
      }),
    };
  }

  async insertOrder(items: OrderItem[]) {
    const products = await this.productsRepository.getAll();

    items.forEach((item) => {
      const product = products.find((product) => product.productId === item.productId);

      if (!product) throw new ProductNotFoundError(item.productId);
    });

    const order = await this.ordersRepository.insert({
      status: 'PENDING',
      isRemoteArea: false,
      items,
      couponIds: [],
    });

    return await this.getOrderById(order.orderId);
  }

  async patchOrder(orderId: Order['orderId'], orderPartial: Partial<Pick<Order, 'isRemoteArea' | 'couponIds'>>) {
    const order = await this.ordersRepository.getById(orderId);

    if (!order) throw new OrderNotFoundError(orderId);

    if (orderPartial.couponIds) {
      const products = await this.productsRepository.getAll();
      const coupons = await this.couponsRepository.getCoupons();
      const userCoupons = await this.couponsRepository.getUserCoupons();
      const orderToValidate = { ...order, ...orderPartial };

      this.couponValidator.validate({
        order: orderToValidate,
        products,
        issuedCoupons: userCoupons,
        coupons,
      });
    }

    const newOrder = { ...order, ...orderPartial };

    await this.ordersRepository.updateById(orderId, newOrder);

    return await this.getOrderById(orderId);
  }

  async getOrderAmount(orderId: Order['orderId'], orderPartial: Partial<Pick<Order, 'isRemoteArea' | 'couponIds'>>) {
    const order = await this.ordersRepository.getById(orderId);

    if (!order) throw new OrderNotFoundError(orderId);

    const orderPreview = { ...order, ...orderPartial };
    const products = await this.productsRepository.getAll();
    const coupons = await this.couponsRepository.getCoupons();
    const userCoupons = await this.couponsRepository.getUserCoupons();

    if (orderPartial.couponIds) {
      this.couponValidator.validate({
        order: orderPreview,
        products,
        issuedCoupons: userCoupons,
        coupons,
      });
    }

    return this.orderAmountCalculator.calculate({
      order: orderPreview,
      products,
      issuedCoupons: userCoupons,
      coupons,
    });
  }
}

export default OrdersService;
