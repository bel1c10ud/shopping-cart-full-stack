import { http, HttpResponse } from 'msw';
import type { AmountSummary, CouponRecommendation, OrderCoupon, OrderItem, OrderWithProduct } from '../types';

const ORDER_API_URL = `${import.meta.env.VITE_API_URL}/order`;

const successResponse = (data: unknown) => {
  return HttpResponse.json({
    status: 'success',
    data,
  });
};

export const createOrder = (override?: Partial<OrderWithProduct>): OrderWithProduct => ({
  orderId: 'order-1',
  status: 'PENDING',
  isRemoteArea: false,
  items: [
    {
      product: {
        productId: 'a',
        name: '상품이름A',
        price: 35000,
        image: 'https://picsum.photos/128/128',
        stock: 10,
      },
      quantity: 2,
    },
    {
      product: {
        productId: 'b',
        name: '상품이름B',
        price: 25000,
        image: 'https://picsum.photos/128/128',
        stock: 5,
      },
      quantity: 1,
    },
  ],
  couponIds: [],
  amount: {
    orderAmount: 95000,
    shippingAmount: 3000,
    discountAmount: 0,
    totalAmount: 98000,
  },
  ...override,
});

export const createOrderCoupons = (): OrderCoupon[] => [
  {
    userCouponId: 'user-coupon-fixed',
    couponId: 'FIXED5000',
    couponType: 'AMOUNT',
    isDisabled: false,
    name: '5,000원 할인 쿠폰',
    dueDate: '2026-11-30',
    minOrderAmount: 100000,
    availableTime: {
      startTime: null,
      endTime: null,
    },
  },
  {
    userCouponId: 'user-coupon-bogo',
    couponId: 'BOGO',
    couponType: 'AMOUNT',
    isDisabled: false,
    name: '2+1 쿠폰',
    dueDate: '2026-06-30',
    minOrderAmount: null,
    availableTime: {
      startTime: null,
      endTime: null,
    },
  },
  {
    userCouponId: 'user-coupon-miracle',
    couponId: 'MIRACLESALE',
    couponType: 'PERCENT',
    isDisabled: false,
    name: '30% 시간제 할인 쿠폰',
    dueDate: '2026-07-31',
    minOrderAmount: null,
    availableTime: {
      startTime: '04:00',
      endTime: '07:00',
    },
  },
  {
    userCouponId: 'user-coupon-disabled',
    couponId: 'FREESHIPPING',
    couponType: 'AMOUNT',
    isDisabled: true,
    name: '무료 배송 쿠폰',
    dueDate: '2026-08-31',
    minOrderAmount: 50000,
    availableTime: {
      startTime: null,
      endTime: null,
    },
  },
];

export const createOrderHandler = (
  order: OrderWithProduct,
  onRequest?: (items: OrderItem[]) => void,
) => {
  return http.post(ORDER_API_URL, async ({ request }) => {
    const body = (await request.json()) as { items: OrderItem[] };

    onRequest?.(body.items);

    return successResponse(order);
  });
};

export const getOrderHandler = (order: OrderWithProduct, onRequest?: (orderId: string) => void) => {
  return http.get(`${ORDER_API_URL}/:orderId`, ({ params }) => {
    onRequest?.(String(params.orderId));

    return successResponse(order);
  });
};

export const getOrderErrorHandler = () => {
  return http.get(`${ORDER_API_URL}/:orderId`, () => {
    return HttpResponse.json(
      {
        status: 'fail',
        data: {
          orderId: '존재하지 않는 주문입니다.',
        },
      },
      { status: 404 },
    );
  });
};

export const updateOrderHandler = (
  order: OrderWithProduct,
  onChange?: (order: OrderWithProduct) => void,
  onRequest?: (body: { isRemoteArea?: boolean; couponIds?: string[] }) => void,
) => {
  return http.patch(`${ORDER_API_URL}/:orderId`, async ({ request }) => {
    const body = (await request.json()) as { isRemoteArea?: boolean; couponIds?: string[] };
    const nextOrder = {
      ...order,
      isRemoteArea: body.isRemoteArea ?? order.isRemoteArea,
      couponIds: body.couponIds ?? order.couponIds,
      amount: body.isRemoteArea
        ? {
            ...order.amount,
            shippingAmount: 6000,
            totalAmount: order.amount.totalAmount + 3000,
          }
        : order.amount,
    };

    onRequest?.(body);
    onChange?.(nextOrder);

    return successResponse(nextOrder);
  });
};

export const getOrderCouponsHandler = (coupons: OrderCoupon[], onRequest?: (orderId: string) => void) => {
  return http.get(`${ORDER_API_URL}/:orderId/coupons`, ({ params }) => {
    onRequest?.(String(params.orderId));

    return successResponse(coupons);
  });
};

export const getOrderAmountHandler = (amount: AmountSummary, onRequest?: (url: URL) => void) => {
  return http.get(`${ORDER_API_URL}/:orderId/amount`, ({ request }) => {
    onRequest?.(new URL(request.url));

    return successResponse(amount);
  });
};

export const getOrderCouponRecommendationHandler = (
  recommendation: CouponRecommendation,
  onRequest?: (orderId: string) => void,
) => {
  return http.get(`${ORDER_API_URL}/:orderId/coupon-recommendation`, ({ params }) => {
    onRequest?.(String(params.orderId));

    return successResponse(recommendation);
  });
};
