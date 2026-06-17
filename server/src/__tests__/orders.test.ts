import request from 'supertest';
import app from '../app';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../constants';
import { orders } from '../repositories/InMemoryOrdersRepository';
import { products } from '../repositories/InMemoryProductsRepository';

describe('주문', () => {
  beforeEach(() => {
    products.clear();
    orders.clear();
  });

  describe('주문 정보 조회 (GET /order/:orderId)', () => {
    it('주문 상품 정보, 도서산간 지역 여부, 쿠폰 식별자 목록, 결제 금액 정보를 조회한다', async () => {
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
});
