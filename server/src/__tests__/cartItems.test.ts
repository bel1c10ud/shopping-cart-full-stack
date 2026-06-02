import request from 'supertest';
import app from '../app';
import { cartItems } from '../repositories/InMemoryCartItemsRepository';
import { products } from '../repositories/InMemoryProductsRepository';

describe('장바구니', () => {
  beforeEach(() => {
    products.clear();
    cartItems.clear();
  });

  it('장바구니 목록을 조회할 수 있다.', async () => {
    products.set('1', {
      productId: '1',
      name: '상품이름A',
      price: 35000,
      image: '이미지',
      stock: 1,
    });

    cartItems.set('1', {
      cartItemId: '1',
      productId: '1',
      quantity: 1,
    });

    await request(app).get('/cart').expect(200);
  });

  it('장바구니에 상품을 추가 할 수 있다.', async () => {
    products.set('1', {
      productId: '1',
      name: '상품이름A',
      price: 35000,
      image: '이미지',
      stock: 1,
    });

    await request(app)
      .post('/cart')
      .send({
        productId: '1',
        quantity: 1,
      })
      .expect(201);
  });

  it('없는 상품을 장바구니에 추가 할 수 없다.', async () => {
    await request(app)
      .post('/cart')
      .send({
        productId: '1',
        quantity: 1,
      })
      .expect(404);
  });

  it('장바구니에 담긴 상품의 수량을 변경할 수 있다.', async () => {
    products.set('1', {
      productId: '1',
      name: '상품이름A',
      price: 35000,
      image: '이미지',
      stock: 1,
    });

    cartItems.set('1', {
      cartItemId: '1',
      productId: '1',
      quantity: 1,
    });

    await request(app)
      .patch('/cart/1')
      .send({
        quantity: 2,
      })
      .expect(200);
  });

  it('장바구니에 담긴 상품을 삭제할 수 있다.', async () => {
    products.set('1', {
      productId: '1',
      name: '상품이름A',
      price: 35000,
      image: '이미지',
      stock: 1,
    });

    cartItems.set('1', {
      cartItemId: '1',
      productId: '1',
      quantity: 1,
    });

    await request(app).delete('/cart/1').expect(200);
  });

  it('장바구니에 상품을 중복 추가할 수 없다.', async () => {
    products.set('1', {
      productId: '1',
      name: '상품이름A',
      price: 35000,
      image: '이미지',
      stock: 1,
    });

    cartItems.set('1', {
      cartItemId: '1',
      productId: '1',
      quantity: 1,
    });

    await request(app)
      .post('/cart')
      .send({
        productId: '1',
        quantity: 1,
      })
      .expect(400);
  });

  describe('장바구니 도메인 검증', () => {
    describe('상품 담기 (POST /cart)', () => {
      describe('productId', () => {
        it('productId가 누락되는 경우 400 에러가 발생한다', async () => {
          await request(app)
            .post('/cart')
            .send({ quantity: 1 })
            .expect(400);
        });

        it('productId가 빈 문자열인 경우 400 에러가 발생한다', async () => {
          products.set('1', {
            productId: '1',
            name: '상품이름A',
            price: 35000,
            image: '이미지',
            stock: 1,
          });

          await request(app)
            .post('/cart')
            .send({ productId: '', quantity: 1 })
            .expect(400);
        });
      });

      describe('quantity', () => {
        beforeEach(() => {
          products.set('1', {
            productId: '1',
            name: '상품이름A',
            price: 35000,
            image: '이미지',
            stock: 10,
          });
        });

        it('quantity가 누락되는 경우 400 에러가 발생한다', async () => {
          await request(app)
            .post('/cart')
            .send({ productId: '1' })
            .expect(400);
        });

        it('quantity가 0인 경우 400 에러가 발생한다', async () => {
          await request(app)
            .post('/cart')
            .send({ productId: '1', quantity: 0 })
            .expect(400);
        });

        it('quantity가 음수인 경우 400 에러가 발생한다', async () => {
          await request(app)
            .post('/cart')
            .send({ productId: '1', quantity: -1 })
            .expect(400);
        });

        it('quantity가 99를 초과하는 경우 400 에러가 발생한다', async () => {
          await request(app)
            .post('/cart')
            .send({ productId: '1', quantity: 100 })
            .expect(400);
        });

        it('quantity가 소수인 경우 400 에러가 발생한다', async () => {
          await request(app)
            .post('/cart')
            .send({ productId: '1', quantity: 1.5 })
            .expect(400);
        });

        it('quantity가 1인 경우 정상 등록된다', async () => {
          await request(app)
            .post('/cart')
            .send({ productId: '1', quantity: 1 })
            .expect(201);
        });

        it('quantity가 99인 경우 정상 등록된다', async () => {
          await request(app)
            .post('/cart')
            .send({ productId: '1', quantity: 99 })
            .expect(201);
        });
      });
    });

    describe('수량 변경 (PATCH /cart/:cartItemId)', () => {
      it('quantity가 누락되는 경우 400 에러가 발생한다', async () => {
        cartItems.set('1', { cartItemId: '1', productId: '1', quantity: 1 });

        await request(app)
          .patch('/cart/1')
          .send({})
          .expect(400);
      });

      it('존재하지 않는 장바구니 항목을 수정하면 404 에러가 발생한다', async () => {
        await request(app)
          .patch('/cart/999')
          .send({ quantity: 2 })
          .expect(404);
      });
    });

    describe('상품 삭제 (DELETE /cart/:cartItemId)', () => {
      it('존재하지 않는 장바구니 항목을 삭제하면 404 에러가 발생한다', async () => {
        await request(app)
          .delete('/cart/999')
          .expect(404);
      });
    });
  });
});
