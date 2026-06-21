import request from 'supertest';
import app from '../app';
import { FREE_SHIPPING_THRESHOLD, REMOTE_AREA_FEE, SHIPPING_FEE } from '../constants';
import { couponStore } from '../repositories/InMemoryCouponsRepository';
import { orders } from '../repositories/InMemoryOrdersRepository';
import { products } from '../repositories/InMemoryProductsRepository';
import { Order } from '../types';

describe('주문', () => {
  beforeEach(() => {
    products.clear();
    orders.clear();
    couponStore.coupons.delete('cp5');
    couponStore.coupons.delete('expired-coupon');
    couponStore.userCoupons.delete('ucp5');
    couponStore.userCoupons.delete('expired-user-coupon');
    couponStore.userCoupons.forEach((userCoupon, userCouponId) => {
      couponStore.userCoupons.set(userCouponId, { ...userCoupon, usedAt: null, usedOrderId: null });
    });
  });

  describe('주문 정보 조회 (GET /order/:orderId)', () => {
    it('주문 상품 정보, 도서산간 지역 여부, 사용자 쿠폰 식별자 목록, 결제 금액 정보를 조회한다', async () => {
      const product = {
        productId: 'product-1',
        name: '상품명',
        price: FREE_SHIPPING_THRESHOLD - 1,
        image: 'https://example.com/product.png',
        stock: 5,
      };

      products.set(product.productId, product);
      orders.set('order-1', {
        orderId: 'order-1',
        status: 'PENDING',
        isRemoteArea: false,
        items: [{ productId: product.productId, quantity: 1 }],
        couponIds: [],
      });

      const response = await request(app).get('/order/order-1').expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          orderId: 'order-1',
          status: 'PENDING',
          isRemoteArea: false,
          items: [{ product, quantity: 1 }],
          couponIds: [],
          amount: {
            orderAmount: product.price,
            shippingAmount: SHIPPING_FEE,
            discountAmount: 0,
            totalAmount: product.price + SHIPPING_FEE,
          },
        },
      });
    });

    it('존재하지 않는 주문을 조회하면 404 에러가 발생한다', async () => {
      const response = await request(app).get('/order/unknown-order').expect(404);

      expect(response.body).toEqual({
        status: 'fail',
        data: {
          orderId: '존재하지 않는 주문입니다.',
        },
      });
    });
  });

  describe('주문 생성 (POST /order)', () => {
    it('상품 식별자와 수량으로 PENDING 상태의 주문을 생성한다', async () => {
      const product = {
        productId: 'product-1',
        name: '상품명',
        price: FREE_SHIPPING_THRESHOLD - 1,
        image: 'https://example.com/product.png',
        stock: 5,
      };

      products.set(product.productId, product);

      const response = await request(app)
        .post('/order')
        .send({
          items: [{ productId: product.productId, quantity: 1 }],
        })
        .expect(201);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          orderId: expect.any(String),
          status: 'PENDING',
          isRemoteArea: false,
          items: [{ product, quantity: 1 }],
          couponIds: [],
          amount: {
            orderAmount: product.price,
            shippingAmount: SHIPPING_FEE,
            discountAmount: 0,
            totalAmount: product.price + SHIPPING_FEE,
          },
        },
      });
    });

    it('items가 누락되면 400 에러가 발생한다', async () => {
      const response = await request(app).post('/order').send({}).expect(400);

      expect(response.body).toEqual({
        status: 'fail',
        data: {
          items: '주문 상품은 1개 이상이어야 합니다.',
        },
      });
    });

    it('items가 빈 배열이면 400 에러가 발생한다', async () => {
      const response = await request(app).post('/order').send({ items: [] }).expect(400);

      expect(response.body).toEqual({
        status: 'fail',
        data: {
          items: '주문 상품은 1개 이상이어야 합니다.',
        },
      });
    });

    it('quantity가 유효하지 않으면 400 에러가 발생한다', async () => {
      const response = await request(app)
        .post('/order')
        .send({ items: [{ productId: 'product-1', quantity: 0 }] })
        .expect(400);

      expect(response.body).toEqual({
        status: 'fail',
        data: {
          quantity: '수량은 1 이상 99 이하의 정수여야 합니다.',
        },
      });
    });

    it('존재하지 않는 상품으로 주문을 생성하면 404 에러가 발생한다', async () => {
      const response = await request(app)
        .post('/order')
        .send({ items: [{ productId: 'unknown-product', quantity: 1 }] })
        .expect(404);

      expect(response.body).toEqual({
        status: 'fail',
        data: {
          productId: '존재하지 않는 상품입니다.',
        },
      });
    });
  });

  describe('주문 금액 조회 (GET /order/:orderId/amount)', () => {
    it('쿼리 파라미터를 임시 적용한 주문 금액을 조회하고 주문 상태는 변경하지 않는다', async () => {
      const product = {
        productId: 'product-1',
        name: '상품명',
        price: FREE_SHIPPING_THRESHOLD,
        image: 'https://example.com/product.png',
        stock: 5,
      };

      const order = {
        orderId: 'order-1',
        status: 'PENDING',
        isRemoteArea: false,
        items: [{ productId: product.productId, quantity: 1 }],
        couponIds: [],
      };

      products.set(product.productId, product);
      orders.set(order.orderId, order as Order);

      const response = await request(app)
        .get('/order/order-1/amount')
        .query({ couponIds: 'ucp1', isRemoteArea: 'true' })
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          orderAmount: product.price,
          shippingAmount: REMOTE_AREA_FEE,
          discountAmount: 5000,
          totalAmount: product.price + REMOTE_AREA_FEE - 5000,
        },
      });

      const orderResponse = await request(app).get('/order/order-1').expect(200);

      expect(orderResponse.body.data).toEqual(
        expect.objectContaining({
          isRemoteArea: false,
          couponIds: [],
          amount: {
            orderAmount: product.price,
            shippingAmount: 0,
            discountAmount: 0,
            totalAmount: product.price,
          },
        }),
      );
    });

    it('쿼리 파라미터가 없으면 저장된 주문 정보 기준으로 주문 금액을 조회한다', async () => {
      const product = {
        productId: 'product-1',
        name: '상품명',
        price: FREE_SHIPPING_THRESHOLD,
        image: 'https://example.com/product.png',
        stock: 5,
      };

      const order = {
        orderId: 'order-1',
        status: 'PENDING',
        isRemoteArea: true,
        items: [{ productId: product.productId, quantity: 1 }],
        couponIds: ['ucp1'],
      };

      products.set(product.productId, product);
      orders.set(order.orderId, order as Order);

      const response = await request(app).get('/order/order-1/amount').expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          orderAmount: product.price,
          shippingAmount: REMOTE_AREA_FEE,
          discountAmount: 5000,
          totalAmount: product.price + REMOTE_AREA_FEE - 5000,
        },
      });
    });

    it('isRemoteArea가 boolean 형식이 아니면 400 에러가 발생한다', async () => {
      const product = {
        productId: 'product-1',
        name: '상품명',
        price: FREE_SHIPPING_THRESHOLD,
        image: 'https://example.com/product.png',
        stock: 5,
      };

      const order = {
        orderId: 'order-1',
        status: 'PENDING',
        isRemoteArea: false,
        items: [{ productId: product.productId, quantity: 1 }],
        couponIds: [],
      };

      products.set(product.productId, product);
      orders.set(order.orderId, order as Order);

      const response = await request(app)
        .get('/order/order-1/amount')
        .query({ isRemoteArea: 'not-boolean' })
        .expect(400);

      expect(response.body).toEqual({
        status: 'fail',
        data: {
          isRemoteArea: '도서산간 여부는 boolean 값이어야 합니다.',
        },
      });
    });

    it('couponIds가 쉼표 구분 문자열 형식이 아니면 400 에러가 발생한다', async () => {
      const product = {
        productId: 'product-1',
        name: '상품명',
        price: FREE_SHIPPING_THRESHOLD,
        image: 'https://example.com/product.png',
        stock: 5,
      };

      const order = {
        orderId: 'order-1',
        status: 'PENDING',
        isRemoteArea: false,
        items: [{ productId: product.productId, quantity: 1 }],
        couponIds: [],
      };

      products.set(product.productId, product);
      orders.set(order.orderId, order as Order);

      const response = await request(app)
        .get('/order/order-1/amount')
        .query({ couponIds: ['ucp1', 'ucp2'] })
        .expect(400);

      expect(response.body).toEqual({
        status: 'fail',
        data: {
          couponIds: '쿠폰 ID 목록 형식이 올바르지 않습니다.',
        },
      });
    });

    it('존재하지 않는 주문의 금액을 조회하면 404 에러가 발생한다', async () => {
      const response = await request(app).get('/order/unknown-order/amount').expect(404);

      expect(response.body).toEqual({
        status: 'fail',
        data: {
          orderId: '존재하지 않는 주문입니다.',
        },
      });
    });

    it('존재하지 않는 쿠폰을 포함하면 404 에러가 발생한다', async () => {
      const product = {
        productId: 'product-1',
        name: '상품명',
        price: FREE_SHIPPING_THRESHOLD,
        image: 'https://example.com/product.png',
        stock: 5,
      };

      const order = {
        orderId: 'order-1',
        status: 'PENDING',
        isRemoteArea: false,
        items: [{ productId: product.productId, quantity: 1 }],
        couponIds: [],
      };

      products.set(product.productId, product);
      orders.set(order.orderId, order as Order);

      const response = await request(app)
        .get('/order/order-1/amount')
        .query({ couponIds: 'unknown-coupon' })
        .expect(404);

      expect(response.body).toEqual({
        status: 'fail',
        data: {
          couponId: '존재하지 않는 쿠폰입니다.',
        },
      });
    });

    it('사용할 수 없는 쿠폰을 포함하면 400 에러가 발생한다', async () => {
      const product = {
        productId: 'product-1',
        name: '상품명',
        price: FREE_SHIPPING_THRESHOLD - 1,
        image: 'https://example.com/product.png',
        stock: 5,
      };

      const order = {
        orderId: 'order-1',
        status: 'PENDING',
        isRemoteArea: false,
        items: [{ productId: product.productId, quantity: 1 }],
        couponIds: [],
      };

      products.set(product.productId, product);
      orders.set(order.orderId, order as Order);

      const response = await request(app).get('/order/order-1/amount').query({ couponIds: 'ucp1' }).expect(400);

      expect(response.body).toEqual({
        status: 'fail',
        data: {
          couponId: '사용할 수 없는 쿠폰입니다.',
        },
      });
    });
  });

  describe('주문 쿠폰 목록 조회 (GET /order/:orderId/coupons)', () => {
    it('현재 주문에서 선택 가능한 쿠폰 후보와 사용 불가 여부를 조회한다', async () => {
      const product = {
        productId: 'product-1',
        name: '상품명',
        price: FREE_SHIPPING_THRESHOLD,
        image: 'https://example.com/product.png',
        stock: 5,
      };

      const order = {
        orderId: 'order-1',
        status: 'PENDING',
        isRemoteArea: false,
        items: [{ productId: product.productId, quantity: 1 }],
        couponIds: [],
      };

      products.set(product.productId, product);
      orders.set(order.orderId, order as Order);

      const response = await request(app).get('/order/order-1/coupons').expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: expect.arrayContaining([
          {
            userCouponId: 'ucp1',
            couponId: 'cp1',
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
            userCouponId: 'ucp2',
            couponId: 'cp2',
            couponType: 'AMOUNT',
            isDisabled: true,
            name: '2+1 쿠폰',
            dueDate: '2026-06-30',
            minOrderAmount: null,
            availableTime: {
              startTime: null,
              endTime: null,
            },
          },
          {
            userCouponId: 'ucp3',
            couponId: 'cp3',
            couponType: 'AMOUNT',
            isDisabled: false,
            name: '무료 배송 쿠폰',
            dueDate: '2026-08-31',
            minOrderAmount: 50000,
            availableTime: {
              startTime: null,
              endTime: null,
            },
          },
          {
            userCouponId: 'ucp4',
            couponId: 'cp4',
            couponType: 'PERCENT',
            isDisabled: true,
            name: '30% 시간제 할인 쿠폰',
            dueDate: '2026-07-31',
            minOrderAmount: null,
            availableTime: {
              startTime: '04:00',
              endTime: '07:00',
            },
          },
        ]),
      });
    });

    it('존재하지 않는 주문의 쿠폰 목록을 조회하면 404 에러가 발생한다', async () => {
      const response = await request(app).get('/order/unknown-order/coupons').expect(404);

      expect(response.body).toEqual({
        status: 'fail',
        data: {
          orderId: '존재하지 않는 주문입니다.',
        },
      });
    });
  });

  describe('주문 정보 수정 (PATCH /order/:orderId)', () => {
    it('도서산간 지역 여부를 수정한다', async () => {
      const product = {
        productId: 'product-1',
        name: '상품명',
        price: FREE_SHIPPING_THRESHOLD,
        image: 'https://example.com/product.png',
        stock: 5,
      };

      products.set(product.productId, product);
      orders.set('order-1', {
        orderId: 'order-1',
        status: 'PENDING',
        isRemoteArea: false,
        items: [{ productId: product.productId, quantity: 1 }],
        couponIds: [],
      });

      const response = await request(app).patch('/order/order-1').send({ isRemoteArea: true }).expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: {
          orderId: 'order-1',
          status: 'PENDING',
          isRemoteArea: true,
          items: [{ product, quantity: 1 }],
          couponIds: [],
          amount: {
            orderAmount: product.price,
            shippingAmount: REMOTE_AREA_FEE,
            discountAmount: 0,
            totalAmount: product.price + REMOTE_AREA_FEE,
          },
        },
      });
    });

    it('수정할 주문 정보가 없으면 400 에러가 발생한다', async () => {
      const response = await request(app).patch('/order/order-1').send({}).expect(400);

      expect(response.body).toEqual({
        status: 'fail',
        data: {
          body: '수정할 주문 정보는 필수입니다.',
        },
      });
    });

    it('isRemoteArea가 boolean 값이 아니면 400 에러가 발생한다', async () => {
      const response = await request(app).patch('/order/order-1').send({ isRemoteArea: 'true' }).expect(400);

      expect(response.body).toEqual({
        status: 'fail',
        data: {
          isRemoteArea: '도서산간 지역 여부는 boolean 값이어야 합니다.',
        },
      });
    });

    it('couponIds가 배열이 아니면 400 에러가 발생한다', async () => {
      const response = await request(app).patch('/order/order-1').send({ couponIds: 'user-coupon-1' }).expect(400);

      expect(response.body).toEqual({
        status: 'fail',
        data: {
          couponIds: '쿠폰 ID 목록은 배열이어야 합니다.',
        },
      });
    });

    it('존재하지 않는 주문을 수정하면 404 에러가 발생한다', async () => {
      const response = await request(app).patch('/order/unknown-order').send({ isRemoteArea: true }).expect(404);

      expect(response.body).toEqual({
        status: 'fail',
        data: {
          orderId: '존재하지 않는 주문입니다.',
        },
      });
    });

    it('존재하지 않는 쿠폰을 포함하면 404 에러가 발생한다', async () => {
      const product = {
        productId: 'product-1',
        name: '상품명',
        price: FREE_SHIPPING_THRESHOLD,
        image: 'https://example.com/product.png',
        stock: 5,
      };

      products.set(product.productId, product);
      orders.set('order-1', {
        orderId: 'order-1',
        status: 'PENDING',
        isRemoteArea: false,
        items: [{ productId: product.productId, quantity: 1 }],
        couponIds: [],
      });

      const response = await request(app)
        .patch('/order/order-1')
        .send({ couponIds: ['unknown-coupon'] })
        .expect(404);

      expect(response.body).toEqual({
        status: 'fail',
        data: {
          couponId: '존재하지 않는 쿠폰입니다.',
        },
      });
    });

    it('주문에 적용 가능한 정액 쿠폰의 할인 금액을 반영한다', async () => {
      const product = {
        productId: 'product-1',
        name: '상품명',
        price: FREE_SHIPPING_THRESHOLD,
        image: 'https://example.com/product.png',
        stock: 5,
      };

      products.set(product.productId, product);
      orders.set('order-1', {
        orderId: 'order-1',
        status: 'PENDING',
        isRemoteArea: false,
        items: [{ productId: product.productId, quantity: 1 }],
        couponIds: [],
      });

      const response = await request(app)
        .patch('/order/order-1')
        .send({ couponIds: ['ucp1'] })
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: expect.objectContaining({
          couponIds: ['ucp1'],
          amount: {
            orderAmount: product.price,
            shippingAmount: 0,
            discountAmount: 5000,
            totalAmount: product.price - 5000,
          },
        }),
      });
    });

    it('주문에 적용 가능한 무료 배송 쿠폰의 할인 금액을 반영한다', async () => {
      const product = {
        productId: 'product-1',
        name: '상품명',
        price: FREE_SHIPPING_THRESHOLD - 1,
        image: 'https://example.com/product.png',
        stock: 5,
      };

      products.set(product.productId, product);
      orders.set('order-1', {
        orderId: 'order-1',
        status: 'PENDING',
        isRemoteArea: false,
        items: [{ productId: product.productId, quantity: 1 }],
        couponIds: [],
      });

      const response = await request(app)
        .patch('/order/order-1')
        .send({ couponIds: ['ucp3'] })
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: expect.objectContaining({
          couponIds: ['ucp3'],
          amount: {
            orderAmount: product.price,
            shippingAmount: SHIPPING_FEE,
            discountAmount: SHIPPING_FEE,
            totalAmount: product.price,
          },
        }),
      });
    });

    it('2+1 쿠폰은 동일 상품을 3개 이상 주문하면 단가가 가장 높은 상품 금액을 할인한다', async () => {
      const cheapProduct = {
        productId: 'cheap-product',
        name: '저가 상품',
        price: 10000,
        image: 'https://example.com/cheap-product.png',
        stock: 5,
      };
      const expensiveProduct = {
        productId: 'expensive-product',
        name: '고가 상품',
        price: 20000,
        image: 'https://example.com/expensive-product.png',
        stock: 5,
      };

      products.set(cheapProduct.productId, cheapProduct);
      products.set(expensiveProduct.productId, expensiveProduct);
      orders.set('order-1', {
        orderId: 'order-1',
        status: 'PENDING',
        isRemoteArea: false,
        items: [
          { productId: cheapProduct.productId, quantity: 3 },
          { productId: expensiveProduct.productId, quantity: 3 },
        ],
        couponIds: [],
      });

      const response = await request(app)
        .patch('/order/order-1')
        .send({ couponIds: ['ucp2'] })
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: expect.objectContaining({
          couponIds: ['ucp2'],
          amount: {
            orderAmount: 90000,
            shippingAmount: SHIPPING_FEE,
            discountAmount: expensiveProduct.price,
            totalAmount: 90000 + SHIPPING_FEE - expensiveProduct.price,
          },
        }),
      });
    });

    it('2+1 쿠폰은 동일 상품을 3개 이상 주문하지 않으면 적용할 수 없다', async () => {
      const firstProduct = {
        productId: 'product-1',
        name: '상품1',
        price: 10000,
        image: 'https://example.com/product-1.png',
        stock: 5,
      };
      const secondProduct = {
        productId: 'product-2',
        name: '상품2',
        price: 20000,
        image: 'https://example.com/product-2.png',
        stock: 5,
      };
      const thirdProduct = {
        productId: 'product-3',
        name: '상품3',
        price: 30000,
        image: 'https://example.com/product-3.png',
        stock: 5,
      };

      products.set(firstProduct.productId, firstProduct);
      products.set(secondProduct.productId, secondProduct);
      products.set(thirdProduct.productId, thirdProduct);
      orders.set('order-1', {
        orderId: 'order-1',
        status: 'PENDING',
        isRemoteArea: false,
        items: [
          { productId: firstProduct.productId, quantity: 1 },
          { productId: secondProduct.productId, quantity: 1 },
          { productId: thirdProduct.productId, quantity: 1 },
        ],
        couponIds: [],
      });

      const response = await request(app)
        .patch('/order/order-1')
        .send({ couponIds: ['ucp2'] })
        .expect(400);

      expect(response.body).toEqual({
        status: 'fail',
        data: {
          couponId: '사용할 수 없는 쿠폰입니다.',
        },
      });
    });

    it('정액 쿠폰을 먼저 적용하고 할인된 금액에서 정률 쿠폰을 적용한다', async () => {
      const product = {
        productId: 'product-1',
        name: '상품명',
        price: FREE_SHIPPING_THRESHOLD,
        image: 'https://example.com/product.png',
        stock: 5,
      };

      products.set(product.productId, product);
      couponStore.coupons.set('cp5', {
        couponId: 'cp5',
        couponType: 'PERCENT',
        code: 'PERCENT10',
        name: '10% 할인 쿠폰',
        expiresAt: '2026-12-31',
        minOrderAmount: null,
        minItemCount: null,
        orderAmountDiscountType: 'PERCENT',
        orderAmountDiscountValue: 10,
        shippingFeeDiscountType: 'NONE',
        shippingFeeDiscountValue: null,
        remoteAreaFeeDiscountType: 'NONE',
        remoteAreaFeeDiscountValue: null,
        itemDiscountType: 'NONE',
        itemDiscountValue: null,
        availableTimeStart: null,
        availableTimeEnd: null,
      });
      couponStore.userCoupons.set('ucp5', {
        userCouponId: 'ucp5',
        couponId: 'cp5',
        issuedAt: '2026-06-18',
        usedAt: null,
        usedOrderId: null,
      });
      orders.set('order-1', {
        orderId: 'order-1',
        status: 'PENDING',
        isRemoteArea: false,
        items: [{ productId: product.productId, quantity: 1 }],
        couponIds: [],
      });

      const response = await request(app)
        .patch('/order/order-1')
        .send({ couponIds: ['ucp1', 'ucp5'] })
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: expect.objectContaining({
          couponIds: ['ucp1', 'ucp5'],
          amount: {
            orderAmount: product.price,
            shippingAmount: 0,
            discountAmount: 14500,
            totalAmount: 85500,
          },
        }),
      });
    });

    it('최소 주문 금액을 만족하지 못하는 쿠폰은 적용할 수 없다', async () => {
      const product = {
        productId: 'product-1',
        name: '상품명',
        price: FREE_SHIPPING_THRESHOLD - 1,
        image: 'https://example.com/product.png',
        stock: 5,
      };

      products.set(product.productId, product);
      orders.set('order-1', {
        orderId: 'order-1',
        status: 'PENDING',
        isRemoteArea: false,
        items: [{ productId: product.productId, quantity: 1 }],
        couponIds: [],
      });

      const response = await request(app)
        .patch('/order/order-1')
        .send({ couponIds: ['ucp1'] })
        .expect(400);

      expect(response.body).toEqual({
        status: 'fail',
        data: {
          couponId: '사용할 수 없는 쿠폰입니다.',
        },
      });
    });

    it('이미 사용된 쿠폰은 적용할 수 없다', async () => {
      const product = {
        productId: 'product-1',
        name: '상품명',
        price: FREE_SHIPPING_THRESHOLD,
        image: 'https://example.com/product.png',
        stock: 5,
      };
      const userCoupon = couponStore.userCoupons.get('ucp1');

      products.set(product.productId, product);
      orders.set('order-1', {
        orderId: 'order-1',
        status: 'PENDING',
        isRemoteArea: false,
        items: [{ productId: product.productId, quantity: 1 }],
        couponIds: [],
      });
      if (userCoupon) couponStore.userCoupons.set('ucp1', { ...userCoupon, usedAt: '2026-06-18' });

      const response = await request(app)
        .patch('/order/order-1')
        .send({ couponIds: ['ucp1'] })
        .expect(400);

      expect(response.body).toEqual({
        status: 'fail',
        data: {
          couponId: '사용할 수 없는 쿠폰입니다.',
        },
      });
    });

    it('만료된 쿠폰은 적용할 수 없다', async () => {
      const product = {
        productId: 'product-1',
        name: '상품명',
        price: FREE_SHIPPING_THRESHOLD,
        image: 'https://example.com/product.png',
        stock: 5,
      };

      products.set(product.productId, product);
      couponStore.coupons.set('expired-coupon', {
        couponId: 'expired-coupon',
        couponType: 'AMOUNT',
        code: 'EXPIRED',
        name: '만료된 쿠폰',
        expiresAt: '2000-01-01',
        minOrderAmount: null,
        minItemCount: null,
        orderAmountDiscountType: 'AMOUNT',
        orderAmountDiscountValue: 1000,
        shippingFeeDiscountType: 'NONE',
        shippingFeeDiscountValue: null,
        remoteAreaFeeDiscountType: 'NONE',
        remoteAreaFeeDiscountValue: null,
        itemDiscountType: 'NONE',
        itemDiscountValue: null,
        availableTimeStart: null,
        availableTimeEnd: null,
      });
      couponStore.userCoupons.set('expired-user-coupon', {
        userCouponId: 'expired-user-coupon',
        couponId: 'expired-coupon',
        issuedAt: '1999-12-31',
        usedAt: null,
        usedOrderId: null,
      });
      orders.set('order-1', {
        orderId: 'order-1',
        status: 'PENDING',
        isRemoteArea: false,
        items: [{ productId: product.productId, quantity: 1 }],
        couponIds: [],
      });

      const response = await request(app)
        .patch('/order/order-1')
        .send({ couponIds: ['expired-user-coupon'] })
        .expect(400);

      expect(response.body).toEqual({
        status: 'fail',
        data: {
          couponId: '사용할 수 없는 쿠폰입니다.',
        },
      });
    });

    it('정액 쿠폰은 최대 1개만 적용할 수 있다', async () => {
      const product = {
        productId: 'product-1',
        name: '상품명',
        price: FREE_SHIPPING_THRESHOLD,
        image: 'https://example.com/product.png',
        stock: 5,
      };

      products.set(product.productId, product);
      orders.set('order-1', {
        orderId: 'order-1',
        status: 'PENDING',
        isRemoteArea: false,
        items: [{ productId: product.productId, quantity: 3 }],
        couponIds: [],
      });

      const response = await request(app)
        .patch('/order/order-1')
        .send({ couponIds: ['ucp1', 'ucp2'] })
        .expect(400);

      expect(response.body).toEqual({
        status: 'fail',
        data: {
          couponId: '사용할 수 없는 쿠폰입니다.',
        },
      });
    });

    it('정률 쿠폰은 최대 1개만 적용할 수 있다', async () => {
      const product = {
        productId: 'product-1',
        name: '상품명',
        price: FREE_SHIPPING_THRESHOLD,
        image: 'https://example.com/product.png',
        stock: 5,
      };

      products.set(product.productId, product);
      couponStore.coupons.set('cp5', {
        couponId: 'cp5',
        couponType: 'PERCENT',
        code: 'PERCENT10',
        name: '10% 할인 쿠폰',
        expiresAt: '2026-12-31',
        minOrderAmount: null,
        minItemCount: null,
        orderAmountDiscountType: 'PERCENT',
        orderAmountDiscountValue: 10,
        shippingFeeDiscountType: 'NONE',
        shippingFeeDiscountValue: null,
        remoteAreaFeeDiscountType: 'NONE',
        remoteAreaFeeDiscountValue: null,
        itemDiscountType: 'NONE',
        itemDiscountValue: null,
        availableTimeStart: null,
        availableTimeEnd: null,
      });
      couponStore.userCoupons.set('ucp5', {
        userCouponId: 'ucp5',
        couponId: 'cp5',
        issuedAt: '2026-06-18',
        usedAt: null,
        usedOrderId: null,
      });
      orders.set('order-1', {
        orderId: 'order-1',
        status: 'PENDING',
        isRemoteArea: false,
        items: [{ productId: product.productId, quantity: 1 }],
        couponIds: [],
      });

      const response = await request(app)
        .patch('/order/order-1')
        .send({ couponIds: ['ucp4', 'ucp5'] })
        .expect(400);

      expect(response.body).toEqual({
        status: 'fail',
        data: {
          couponId: '사용할 수 없는 쿠폰입니다.',
        },
      });

      couponStore.coupons.delete('cp5');
      couponStore.userCoupons.delete('ucp5');
    });
  });
});
