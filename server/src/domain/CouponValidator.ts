import { CouponUnavailableError } from '../errors';
import { calculateOrderProductsAmount, getAppliedCoupons, getAppliedIssuedCoupons } from './orderResolver';
import { Coupon, Order, Product, UserCoupon } from '../types';
import { formatServerLocalDate } from '../util';

interface CouponValidatorValidateParams {
  order: Order;
  products: Product[];
  issuedCoupons: UserCoupon[];
  coupons: Coupon[];
  now?: Date;
}

class CouponValidator {
  validate({ order, products, issuedCoupons, coupons, now = new Date() }: CouponValidatorValidateParams) {
    const appliedIssuedCoupons = getAppliedIssuedCoupons({ order, issuedCoupons });
    const appliedCoupons = getAppliedCoupons({ issuedCoupons: appliedIssuedCoupons, coupons });
    const orderAmount = calculateOrderProductsAmount({ order, products });

    this.validateIssuedCouponState({ issuedCoupons: appliedIssuedCoupons, coupons: appliedCoupons, now });
    this.validateCouponTypeLimit(appliedCoupons);
    this.validateOrderCondition({ coupons: appliedCoupons, order, orderAmount, now });
  }

  private validateIssuedCouponState({
    issuedCoupons,
    coupons,
    now,
  }: {
    issuedCoupons: UserCoupon[];
    coupons: Coupon[];
    now: Date;
  }) {
    for (const issuedCoupon of issuedCoupons) {
      const coupon = coupons.find((coupon) => coupon.couponId === issuedCoupon.couponId);

      if (!coupon) throw new CouponUnavailableError(issuedCoupon.userCouponId);
      if (!this.isUsableUserCoupon(issuedCoupon)) throw new CouponUnavailableError(coupon.couponId);
      if (this.isExpiredCoupon(coupon, now)) throw new CouponUnavailableError(coupon.couponId);
    }
  }

  private validateCouponTypeLimit(coupons: Coupon[]) {
    const amountCouponCount = coupons.filter((coupon) => coupon.couponType === 'AMOUNT').length;
    const percentCouponCount = coupons.filter((coupon) => coupon.couponType === 'PERCENT').length;

    if (amountCouponCount > 1 || percentCouponCount > 1) throw new CouponUnavailableError('');
  }

  private isUsableUserCoupon(userCoupon: UserCoupon) {
    return !userCoupon.usedAt && !userCoupon.usedOrderId;
  }

  private validateOrderCondition({
    coupons,
    order,
    orderAmount,
    now,
  }: {
    coupons: Coupon[];
    order: Order;
    orderAmount: number;
    now: Date;
  }) {
    for (const coupon of coupons) {
      if (coupon.minOrderAmount !== null && orderAmount < coupon.minOrderAmount) {
        throw new CouponUnavailableError(coupon.couponId);
      }
      if (!this.isSatisfiedItemCount(coupon, order)) {
        throw new CouponUnavailableError(coupon.couponId);
      }
      if (!this.isCouponAvailableTime(coupon, now)) throw new CouponUnavailableError(coupon.couponId);
    }
  }

  private isSatisfiedItemCount(coupon: Coupon, order: Order) {
    if (coupon.minItemCount === null) return true;
    if (coupon.itemDiscountType === 'FREE_COUNT') {
      return order.items.some((item) => item.quantity >= (coupon.minItemCount ?? 0));
    }

    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return itemCount >= coupon.minItemCount;
  }

  private isExpiredCoupon(coupon: Coupon, now: Date) {
    const today = formatServerLocalDate(now);

    return coupon.expiresAt < today;
  }

  private isCouponAvailableTime(coupon: Coupon, now: Date) {
    if (!coupon.availableTimeStart || !coupon.availableTimeEnd) return true;

    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    return coupon.availableTimeStart <= currentTime && currentTime <= coupon.availableTimeEnd;
  }

}

export default CouponValidator;
