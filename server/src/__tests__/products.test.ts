import request from 'supertest';
import app from '../app';
import { products } from '../repositories/InMemoryProductsRepository';
import { cartItems } from '../repositories/InMemoryCartItemsRepository';

describe('상품', () => {
  beforeEach(() => {
    products.clear();
    cartItems.clear();
  });

  it('상품 목록을 조회할 수 있다.', async () => {
    products.set('1', {
      productId: '1',
      name: '상품이름A',
      price: 35000,
      image: '이미지',
      stock: 1,
    });

    const response = await request(app).get('/products').expect(200);
    expect(response.body).toEqual({
      status: 'success',
      data: expect.arrayContaining([
        expect.objectContaining({
          productId: '1',
          name: '상품이름A',
          price: 35000,
          image: '이미지',
          stock: 1,
        }),
      ]),
    });
  });

  it('상품을 추가할 수 있다.', async () => {
    const response = await request(app)
      .post('/products')
      .send({
        name: '상품이름A',
        price: 35000,
        image: '이미지',
        stock: 1,
      })
      .expect(201);

    expect(response.body).toEqual({
      status: 'success',
      data: expect.objectContaining({
        productId: expect.any(String),
        name: '상품이름A',
        price: 35000,
        image: '이미지',
        stock: 1,
      }),
    });
  });

  describe('상품 도메인 검증', () => {
    describe('상품명(name)', () => {
      it('상품명이 누락되는 경우 400 에러가 발생한다', async () => {
        const response = await request(app)
          .post('/products')
          .send({ price: 35000, image: '이미지', stock: 1 })
          .expect(400);

        expect(response.body).toEqual({
          status: 'fail',
          data: expect.objectContaining({ name: expect.any(String) }),
        });
      });

      it('상품명이 빈 문자열인 경우 400 에러가 발생한다', async () => {
        const response = await request(app)
          .post('/products')
          .send({ name: '', price: 35000, image: '이미지', stock: 1 })
          .expect(400);

        expect(response.body).toEqual({
          status: 'fail',
          data: expect.objectContaining({ name: expect.any(String) }),
        });
      });

      it('상품명이 100자를 초과하는 경우 400 에러가 발생한다', async () => {
        const response = await request(app)
          .post('/products')
          .send({ name: 'a'.repeat(101), price: 35000, image: '이미지', stock: 1 })
          .expect(400);

        expect(response.body).toEqual({
          status: 'fail',
          data: expect.objectContaining({ name: expect.any(String) }),
        });
      });

      it('상품명이 100자인 경우 정상 등록된다', async () => {
        await request(app)
          .post('/products')
          .send({ name: 'a'.repeat(100), price: 35000, image: '이미지', stock: 1 })
          .expect(201);
      });
    });

    describe('가격(price)', () => {
      it('price가 누락되는 경우 400 에러가 발생한다', async () => {
        const response = await request(app)
          .post('/products')
          .send({ name: '상품이름A', image: '이미지', stock: 1 })
          .expect(400);

        expect(response.body).toEqual({
          status: 'fail',
          data: expect.objectContaining({ price: expect.any(String) }),
        });
      });

      it('price가 0인 경우 400 에러가 발생한다', async () => {
        const response = await request(app)
          .post('/products')
          .send({ name: '상품이름A', price: 0, image: '이미지', stock: 1 })
          .expect(400);

        expect(response.body).toEqual({
          status: 'fail',
          data: expect.objectContaining({ price: expect.any(String) }),
        });
      });

      it('price가 음수인 경우 400 에러가 발생한다', async () => {
        const response = await request(app)
          .post('/products')
          .send({ name: '상품이름A', price: -1, image: '이미지', stock: 1 })
          .expect(400);

        expect(response.body).toEqual({
          status: 'fail',
          data: expect.objectContaining({ price: expect.any(String) }),
        });
      });

      it('price가 소수인 경우 400 에러가 발생한다', async () => {
        const response = await request(app)
          .post('/products')
          .send({ name: '상품이름A', price: 1.5, image: '이미지', stock: 1 })
          .expect(400);

        expect(response.body).toEqual({
          status: 'fail',
          data: expect.objectContaining({ price: expect.any(String) }),
        });
      });
    });

    describe('재고(stock)', () => {
      it('stock이 누락되는 경우 400 에러가 발생한다', async () => {
        const response = await request(app)
          .post('/products')
          .send({ name: '상품이름A', price: 35000, image: '이미지' })
          .expect(400);

        expect(response.body).toEqual({
          status: 'fail',
          data: expect.objectContaining({ stock: expect.any(String) }),
        });
      });

      it('stock이 음수인 경우 400 에러가 발생한다', async () => {
        const response = await request(app)
          .post('/products')
          .send({ name: '상품이름A', price: 35000, image: '이미지', stock: -1 })
          .expect(400);

        expect(response.body).toEqual({
          status: 'fail',
          data: expect.objectContaining({ stock: expect.any(String) }),
        });
      });

      it('stock이 99를 초과하는 경우 400 에러가 발생한다', async () => {
        const response = await request(app)
          .post('/products')
          .send({ name: '상품이름A', price: 35000, image: '이미지', stock: 100 })
          .expect(400);

        expect(response.body).toEqual({
          status: 'fail',
          data: expect.objectContaining({ stock: expect.any(String) }),
        });
      });

      it('stock이 소수인 경우 400 에러가 발생한다', async () => {
        const response = await request(app)
          .post('/products')
          .send({ name: '상품이름A', price: 35000, image: '이미지', stock: 1.5 })
          .expect(400);

        expect(response.body).toEqual({
          status: 'fail',
          data: expect.objectContaining({ stock: expect.any(String) }),
        });
      });

      it('stock이 0인 경우 정상 등록된다', async () => {
        await request(app)
          .post('/products')
          .send({ name: '상품이름A', price: 35000, image: '이미지', stock: 0 })
          .expect(201);
      });

      it('stock이 99인 경우 정상 등록된다', async () => {
        await request(app)
          .post('/products')
          .send({ name: '상품이름A', price: 35000, image: '이미지', stock: 99 })
          .expect(201);
      });
    });

    describe('이미지(image)', () => {
      it('image가 누락되는 경우 400 에러가 발생한다', async () => {
        const response = await request(app)
          .post('/products')
          .send({ name: '상품이름A', price: 35000, stock: 1 })
          .expect(400);

        expect(response.body).toEqual({
          status: 'fail',
          data: expect.objectContaining({ image: expect.any(String) }),
        });
      });
    });
  });

  it('상품을 삭제할 수 있다.', async () => {
    products.set('1', {
      productId: '1',
      name: '상품이름A',
      price: 35000,
      image: '이미지',
      stock: 1,
    });

    const response = await request(app).delete('/products/1').expect(200);
    expect(response.body).toEqual({
      status: 'success',
      data: { productId: '1' },
    });
  });

  it('존재하지 않는 상품을 삭제하면 404 에러가 발생한다.', async () => {
    const response = await request(app).delete('/products/999').expect(404);
    expect(response.body).toEqual({
      status: 'fail',
      data: expect.objectContaining({ productId: expect.any(String) }),
    });
  });

  it('상품을 삭제시, 장바구니에서도 해당 상품이 삭제된다.', async () => {
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

    await request(app).delete('/products/1');
    const cartResponse = await request(app).get('/cart').expect(200);

    expect(cartResponse.body.data).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({
          productId: '1',
        }),
      ]),
    );
  });
});
