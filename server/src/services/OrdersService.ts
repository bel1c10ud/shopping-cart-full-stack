import {
  CouponNotFoundError,
  OrderNotFoundError,
  ProductNotFoundError,
} from '../errors';
import CouponValidator from '../domain/CouponValidator';
import OrderAmountCalculator from '../domain/OrderAmountCalculator';
import { toOrderItemsWithProducts } from '../mappers/orderMapper';
import {
  CouponsRepository,
  Coupon,
  CouponRecommendation,
  Order,
  OrderCoupon,
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

      this.couponValidator.validateOrThrow({
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
      this.couponValidator.validateOrThrow({
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

  async getOrderCoupons(orderId: Order['orderId']): Promise<OrderCoupon[]> {
    const order = await this.ordersRepository.getById(orderId);

    if (!order) throw new OrderNotFoundError(orderId);

    const products = await this.productsRepository.getAll();
    const coupons = await this.couponsRepository.getCoupons();
    const userCoupons = await this.couponsRepository.getUserCoupons();

    return userCoupons.map((userCoupon) => {
      const coupon = coupons.find((coupon) => coupon.couponId === userCoupon.couponId);

      if (!coupon) throw new CouponNotFoundError(userCoupon.couponId);

      return {
        userCouponId: userCoupon.userCouponId,
        couponId: coupon.couponId,
        couponType: coupon.couponType,
        isDisabled: this.isDisabledCoupon({ coupon, order, products, userCoupons }),
        name: coupon.name,
        dueDate: coupon.expiresAt,
        minOrderAmount: coupon.minOrderAmount,
        availableTime: {
          startTime: coupon.availableTimeStart,
          endTime: coupon.availableTimeEnd,
        },
      };
    });
  }

  async getOrderCouponRecommendation(orderId: Order['orderId']): Promise<CouponRecommendation> {
    const order = await this.ordersRepository.getById(orderId);

    if (!order) throw new OrderNotFoundError(orderId);

    const products = await this.productsRepository.getAll();
    const coupons = await this.couponsRepository.getCoupons();
    const userCoupons = await this.couponsRepository.getUserCoupons();
    const couponCombinations = this.getCouponCombinations(userCoupons.map((userCoupon) => userCoupon.userCouponId));
    const recommendedCouponIds = couponCombinations.reduce(
      (bestCouponIds, couponIds) =>
        this.isBetterCouponIds({ order, products, coupons, userCoupons, bestCouponIds, couponIds })
          ? couponIds
          : bestCouponIds,
      [],
    );

    return { couponIds: recommendedCouponIds };
  }

  private getCouponCombinations(couponIds: string[]) {
    return couponIds.reduce<string[][]>(
      (combinations, couponId, index) => [
        ...combinations,
        [couponId],
        ...couponIds.slice(index + 1).map((nextCouponId) => [couponId, nextCouponId]),
      ],
      [[]],
    );
  }

  private isBetterCouponIds({
    order,
    products,
    coupons,
    userCoupons,
    bestCouponIds,
    couponIds,
  }: {
    order: Order;
    products: Awaited<ReturnType<ProductsRepository['getAll']>>;
    coupons: Awaited<ReturnType<CouponsRepository['getCoupons']>>;
    userCoupons: Awaited<ReturnType<CouponsRepository['getUserCoupons']>>;
    bestCouponIds: string[];
    couponIds: string[];
  }) {
    const bestAmount = this.calculateAmountSafely({ order, products, coupons, userCoupons, couponIds: bestCouponIds });
    const nextAmount = this.calculateAmountSafely({ order, products, coupons, userCoupons, couponIds });

    if (!nextAmount) return false;
    if (!bestAmount) return true;

    return nextAmount.totalAmount < bestAmount.totalAmount;
  }

  private calculateAmountSafely({
    order,
    products,
    coupons,
    userCoupons,
    couponIds,
  }: {
    order: Order;
    products: Awaited<ReturnType<ProductsRepository['getAll']>>;
    coupons: Awaited<ReturnType<CouponsRepository['getCoupons']>>;
    userCoupons: Awaited<ReturnType<CouponsRepository['getUserCoupons']>>;
    couponIds: string[];
  }) {
    const orderPreview = { ...order, couponIds };

    if (!this.couponValidator.isValid({ order: orderPreview, products, issuedCoupons: userCoupons, coupons })) {
      return null;
    }

    return this.orderAmountCalculator.calculate({ order: orderPreview, products, issuedCoupons: userCoupons, coupons });
  }

  private isDisabledCoupon({
    coupon,
    order,
    products,
    userCoupons,
  }: {
    coupon: Coupon;
    order: Order;
    products: Awaited<ReturnType<ProductsRepository['getAll']>>;
    userCoupons: Awaited<ReturnType<CouponsRepository['getUserCoupons']>>;
  }) {
    const userCoupon = userCoupons.find((userCoupon) => userCoupon.couponId === coupon.couponId);

    if (!userCoupon) return true;

    return !this.couponValidator.isValid({
      order: { ...order, couponIds: [userCoupon.userCouponId] },
      products,
      issuedCoupons: [userCoupon],
      coupons: [coupon],
    });
  }
}

export default OrdersService;
