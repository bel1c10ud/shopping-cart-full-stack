import { Coupon, CouponsRepository, UserCoupon } from '../types';

export const couponStore = {
  coupons: new Map<string, Coupon>([
    [
      'cp1',
      {
        couponId: 'cp1',
        couponType: 'AMOUNT',
        code: 'FIXED5000',
        name: '5,000원 할인 쿠폰',
        expiresAt: '2026-11-30',
        minOrderAmount: 100000,
        minItemCount: null,
        orderAmountDiscountType: 'AMOUNT',
        orderAmountDiscountValue: 5000,
        shippingFeeDiscountType: 'NONE',
        shippingFeeDiscountValue: null,
        remoteAreaFeeDiscountType: 'NONE',
        remoteAreaFeeDiscountValue: null,
        itemDiscountType: 'NONE',
        itemDiscountValue: null,
        availableTimeStart: null,
        availableTimeEnd: null,
      },
    ],
    [
      'cp2',
      {
        couponId: 'cp2',
        couponType: 'AMOUNT',
        code: 'BOGO',
        name: '2+1 쿠폰',
        expiresAt: '2026-06-30',
        minOrderAmount: null,
        minItemCount: 3,
        orderAmountDiscountType: 'NONE',
        orderAmountDiscountValue: null,
        shippingFeeDiscountType: 'NONE',
        shippingFeeDiscountValue: null,
        remoteAreaFeeDiscountType: 'NONE',
        remoteAreaFeeDiscountValue: null,
        itemDiscountType: 'FREE_COUNT',
        itemDiscountValue: 1,
        availableTimeStart: null,
        availableTimeEnd: null,
      },
    ],
    [
      'cp3',
      {
        couponId: 'cp3',
        couponType: 'AMOUNT',
        code: 'FREESHIPPING',
        name: '무료 배송 쿠폰',
        expiresAt: '2026-08-31',
        minOrderAmount: 50000,
        minItemCount: null,
        orderAmountDiscountType: 'NONE',
        orderAmountDiscountValue: null,
        shippingFeeDiscountType: 'FREE',
        shippingFeeDiscountValue: null,
        remoteAreaFeeDiscountType: 'FREE',
        remoteAreaFeeDiscountValue: null,
        itemDiscountType: 'NONE',
        itemDiscountValue: null,
        availableTimeStart: null,
        availableTimeEnd: null,
      },
    ],
    [
      'cp4',
      {
        couponId: 'cp4',
        couponType: 'PERCENT',
        code: 'MIRACLESALE',
        name: '30% 시간제 할인 쿠폰',
        expiresAt: '2026-07-31',
        minOrderAmount: null,
        minItemCount: null,
        orderAmountDiscountType: 'PERCENT',
        orderAmountDiscountValue: 30,
        shippingFeeDiscountType: 'FREE',
        shippingFeeDiscountValue: null,
        remoteAreaFeeDiscountType: 'FREE',
        remoteAreaFeeDiscountValue: null,
        itemDiscountType: 'NONE',
        itemDiscountValue: null,
        availableTimeStart: '04:00',
        availableTimeEnd: '07:00',
      },
    ],
  ]),

  userCoupons: new Map<string, UserCoupon>([
    [
      'ucp1',
      {
        userCouponId: 'ucp1',
        couponId: 'cp1',
        issuedAt: '2026-06-16',
        usedAt: null,
        usedOrderId: null,
      },
    ],
    [
      'ucp2',
      {
        userCouponId: 'ucp2',
        couponId: 'cp2',
        issuedAt: '2026-06-16',
        usedAt: null,
        usedOrderId: null,
      },
    ],
    [
      'ucp3',
      {
        userCouponId: 'ucp3',
        couponId: 'cp3',
        issuedAt: '2026-06-16',
        usedAt: null,
        usedOrderId: null,
      },
    ],
    [
      'ucp4',
      {
        userCouponId: 'ucp4',
        couponId: 'cp4',
        issuedAt: '2026-06-16',
        usedAt: null,
        usedOrderId: null,
      },
    ],
  ]),
};

class InMemoryCouponsRepository implements CouponsRepository {
  store;

  constructor() {
    this.store = couponStore;
  }

  async getCoupons() {
    return Array.from(this.store.coupons.entries()).map((entry) => entry[1]);
  }

  async getUserCoupons() {
    return Array.from(this.store.userCoupons.entries()).map((entry) => entry[1]);
  }
}

export default InMemoryCouponsRepository;
