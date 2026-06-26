import { CouponTypeLimitError, CouponUnavailableError } from '../errors';
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

type CouponValidationResult =
  | { isValid: true }
  | { isValid: false; reason: 'COUPON_UNAVAILABLE'; couponId: Coupon['couponId'] | UserCoupon['userCouponId'] }
  | {
      isValid: false;
      reason: 'COUPON_TYPE_LIMIT_EXCEEDED';
      couponType: Coupon['couponType'];
      couponIds: Coupon['couponId'][];
    };

class CouponValidator {
  validateOrThrow(params: CouponValidatorValidateParams) {
    const result = this.validate(params);

    if (result.isValid) return;

    if (result.reason === 'COUPON_TYPE_LIMIT_EXCEEDED') {
      throw new CouponTypeLimitError(result.couponType, result.couponIds);
    }

    throw new CouponUnavailableError(result.couponId);
  }

  isValid(params: CouponValidatorValidateParams) {
    return this.validate(params).isValid;
  }

  validate({
    order,
    products,
    issuedCoupons,
    coupons,
    now = new Date(),
  }: CouponValidatorValidateParams): CouponValidationResult {
    const appliedIssuedCoupons = getAppliedIssuedCoupons({ order, issuedCoupons });
    const appliedCoupons = getAppliedCoupons({ issuedCoupons: appliedIssuedCoupons, coupons });
    const orderAmount = calculateOrderProductsAmount({ order, products });
    const issuedCouponStateResult = this.checkIssuedCouponState({
      issuedCoupons: appliedIssuedCoupons,
      coupons: appliedCoupons,
      now,
    });

    if (!issuedCouponStateResult.isValid) return issuedCouponStateResult;

    const couponTypeLimitResult = this.checkCouponTypeLimit(appliedCoupons);

    if (!couponTypeLimitResult.isValid) return couponTypeLimitResult;

    const orderConditionResult = this.checkOrderCondition({ coupons: appliedCoupons, order, orderAmount, now });

    if (!orderConditionResult.isValid) return orderConditionResult;

    return { isValid: true };
  }

  private checkIssuedCouponState({
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

      if (!coupon) return { isValid: false, reason: 'COUPON_UNAVAILABLE', couponId: issuedCoupon.userCouponId } as const;
      if (!this.isUsableUserCoupon(issuedCoupon)) {
        return { isValid: false, reason: 'COUPON_UNAVAILABLE', couponId: coupon.couponId } as const;
      }
      if (this.isExpiredCoupon(coupon, now)) {
        return { isValid: false, reason: 'COUPON_UNAVAILABLE', couponId: coupon.couponId } as const;
      }
    }

    return { isValid: true } as const;
  }

  private checkCouponTypeLimit(coupons: Coupon[]): CouponValidationResult {
    const amountCoupons = coupons.filter((coupon) => coupon.couponType === 'AMOUNT');
    const percentCoupons = coupons.filter((coupon) => coupon.couponType === 'PERCENT');

    if (amountCoupons.length > 1) {
      return {
        isValid: false,
        reason: 'COUPON_TYPE_LIMIT_EXCEEDED',
        couponType: 'AMOUNT',
        couponIds: amountCoupons.map((coupon) => coupon.couponId),
      };
    }

    if (percentCoupons.length > 1) {
      return {
        isValid: false,
        reason: 'COUPON_TYPE_LIMIT_EXCEEDED',
        couponType: 'PERCENT',
        couponIds: percentCoupons.map((coupon) => coupon.couponId),
      };
    }

    return { isValid: true };
  }

  private isUsableUserCoupon(userCoupon: UserCoupon) {
    return !userCoupon.usedAt && !userCoupon.usedOrderId;
  }

  private checkOrderCondition({
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
        return { isValid: false, reason: 'COUPON_UNAVAILABLE', couponId: coupon.couponId } as const;
      }
      if (!this.isSatisfiedItemCount(coupon, order)) {
        return { isValid: false, reason: 'COUPON_UNAVAILABLE', couponId: coupon.couponId } as const;
      }
      if (!this.isCouponAvailableTime(coupon, now)) {
        return { isValid: false, reason: 'COUPON_UNAVAILABLE', couponId: coupon.couponId } as const;
      }
    }

    return { isValid: true } as const;
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
