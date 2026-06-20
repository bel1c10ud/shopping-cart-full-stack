import { CouponNotFoundError, ProductNotFoundError } from '../errors';
import { Coupon, Order, Product, UserCoupon } from '../types';

export function getAppliedIssuedCoupons({ order, issuedCoupons }: { order: Order; issuedCoupons: UserCoupon[] }) {
  return order.couponIds.map((userCouponId) => {
    const issuedCoupon = issuedCoupons.find((issuedCoupon) => issuedCoupon.userCouponId === userCouponId);

    if (!issuedCoupon) throw new CouponNotFoundError(userCouponId);

    return issuedCoupon;
  });
}

export function getAppliedCoupons({ issuedCoupons, coupons }: { issuedCoupons: UserCoupon[]; coupons: Coupon[] }) {
  return issuedCoupons.map((issuedCoupon) => {
    const coupon = coupons.find((coupon) => coupon.couponId === issuedCoupon.couponId);

    if (!coupon) throw new CouponNotFoundError(issuedCoupon.userCouponId);

    return coupon;
  });
}

export function calculateOrderProductsAmount({ order, products }: { order: Order; products: Product[] }) {
  return order.items.reduce((sum, item) => {
    const product = getProductById({ productId: item.productId, products });

    return sum + product.price * item.quantity;
  }, 0);
}

export function getOrderItemPrices({ order, products }: { order: Order; products: Product[] }) {
  return order.items.flatMap((item) => {
    const product = getProductById({ productId: item.productId, products });

    return Array(item.quantity).fill(product.price);
  });
}

function getProductById({ productId, products }: { productId: Product['productId']; products: Product[] }) {
  const product = products.find((product) => product.productId === productId);

  if (!product) throw new ProductNotFoundError(productId);

  return product;
}
