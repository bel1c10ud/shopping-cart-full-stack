import { FREE_SHIPPING_THRESHOLD, REMOTE_AREA_FEE, SHIPPING_FEE } from '../constants';
import {
  calculateOrderProductsAmount,
  getAppliedCoupons,
  getAppliedIssuedCoupons,
} from './orderResolver';
import { Coupon, Order, Product, UserCoupon } from '../types';

interface OrderAmountCalculatorCalculateParams {
  order: Order;
  products: Product[];
  issuedCoupons: UserCoupon[];
  coupons?: Coupon[];
}

class OrderAmountCalculator {
  calculate({ order, products, issuedCoupons, coupons = [] }: OrderAmountCalculatorCalculateParams) {
    const appliedIssuedCoupons = getAppliedIssuedCoupons({ order, issuedCoupons });
    const appliedCoupons = getAppliedCoupons({ issuedCoupons: appliedIssuedCoupons, coupons });

    const orderAmount = calculateOrderProductsAmount({ order, products });

    const defaultShippingAmount = orderAmount === 0 || orderAmount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

    const shippingAmount = order.isRemoteArea ? defaultShippingAmount + REMOTE_AREA_FEE : defaultShippingAmount;

    const discountAmount = this.calculateDiscountAmount({
      coupons: appliedCoupons,
      order,
      products,
      orderAmount,
      defaultShippingAmount,
      isRemoteArea: order.isRemoteArea,
    });

    const totalAmount = orderAmount + shippingAmount - discountAmount;

    return { orderAmount, shippingAmount, discountAmount, totalAmount };
  }

  private calculateDiscountAmount({
    coupons,
    order,
    products,
    orderAmount,
    defaultShippingAmount,
    isRemoteArea,
  }: {
    coupons: Coupon[];
    order: Order;
    products: Product[];
    orderAmount: number;
    defaultShippingAmount: number;
    isRemoteArea: boolean;
  }) {
    const remoteAreaAmount = isRemoteArea ? REMOTE_AREA_FEE : 0;
    const sortedCoupons = [...coupons].sort((a, b) => this.getCouponOrder(a) - this.getCouponOrder(b));

    const orderDiscount = this.calculateOrderDiscount({ coupons: sortedCoupons, order, products, orderAmount });
    const shippingDiscount = this.calculateShippingDiscount(sortedCoupons, defaultShippingAmount);
    const remoteAreaDiscount = this.calculateRemoteAreaDiscount(sortedCoupons, remoteAreaAmount);

    return orderDiscount + shippingDiscount + remoteAreaDiscount;
  }

  private getCouponOrder(coupon: Coupon) {
    return coupon.couponType === 'PERCENT' ? 1 : 0;
  }

  private calculateOrderDiscount({
    coupons,
    order,
    products,
    orderAmount,
  }: {
    coupons: Coupon[];
    order: Order;
    products: Product[];
    orderAmount: number;
  }) {
    return coupons.reduce(
      ({ discountAmount, remainingAmount }, coupon) => {
        const discount = this.calculateSingleOrderDiscount({ coupon, order, products, orderAmount: remainingAmount });

        return {
          discountAmount: discountAmount + discount,
          remainingAmount: remainingAmount - discount,
        };
      },
      { discountAmount: 0, remainingAmount: orderAmount },
    ).discountAmount;
  }

  private calculateSingleOrderDiscount({
    coupon,
    order,
    products,
    orderAmount,
  }: {
    coupon: Coupon;
    order: Order;
    products: Product[];
    orderAmount: number;
  }) {
    const itemDiscount = this.calculateSingleItemDiscount({ coupon, order, products });

    if (coupon.orderAmountDiscountType === 'AMOUNT') {
      return Math.min((coupon.orderAmountDiscountValue ?? 0) + itemDiscount, orderAmount);
    }
    if (coupon.orderAmountDiscountType === 'PERCENT') {
      return Math.floor((orderAmount * (coupon.orderAmountDiscountValue ?? 0)) / 100);
    }

    return Math.min(itemDiscount, orderAmount);
  }

  private calculateShippingDiscount(coupons: Coupon[], shippingAmount: number) {
    return coupons.reduce(
      ({ discountAmount, remainingAmount }, coupon) => {
        const discount = this.calculateSingleShippingDiscount(coupon, remainingAmount);

        return {
          discountAmount: discountAmount + discount,
          remainingAmount: remainingAmount - discount,
        };
      },
      { discountAmount: 0, remainingAmount: shippingAmount },
    ).discountAmount;
  }

  private calculateSingleShippingDiscount(coupon: Coupon, shippingAmount: number) {
    if (coupon.shippingFeeDiscountType === 'FREE') return shippingAmount;
    if (coupon.shippingFeeDiscountType === 'AMOUNT')
      return Math.min(coupon.shippingFeeDiscountValue ?? 0, shippingAmount);

    return 0;
  }

  private calculateRemoteAreaDiscount(coupons: Coupon[], remoteAreaAmount: number) {
    return coupons.reduce(
      ({ discountAmount, remainingAmount }, coupon) => {
        const discount = this.calculateSingleRemoteAreaDiscount(coupon, remainingAmount);

        return {
          discountAmount: discountAmount + discount,
          remainingAmount: remainingAmount - discount,
        };
      },
      { discountAmount: 0, remainingAmount: remoteAreaAmount },
    ).discountAmount;
  }

  private calculateSingleRemoteAreaDiscount(coupon: Coupon, remoteAreaAmount: number) {
    if (coupon.remoteAreaFeeDiscountType === 'FREE') return remoteAreaAmount;
    if (coupon.remoteAreaFeeDiscountType === 'AMOUNT') {
      return Math.min(coupon.remoteAreaFeeDiscountValue ?? 0, remoteAreaAmount);
    }

    return 0;
  }

  private calculateSingleItemDiscount({
    coupon,
    order,
    products,
  }: {
    coupon: Coupon;
    order: Order;
    products: Product[];
  }) {
    if (coupon.itemDiscountType !== 'FREE_COUNT') return 0;

    const qualifyingItemPrices = order.items
      .filter((item) => item.quantity >= (coupon.minItemCount ?? 0))
      .map((item) => products.find((product) => product.productId === item.productId)?.price ?? 0)
      .sort((a, b) => b - a);

    return qualifyingItemPrices.slice(0, coupon.itemDiscountValue ?? 0).reduce((sum, price) => sum + price, 0);
  }
}

export default OrderAmountCalculator;
