import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import CartPage from '../pages/CartPage';
import { server } from '../mocks/server';

const mockCartItems = [
  {
    cartItemId: '1',
    quantity: 2,
    product: {
      productId: 'a',
      name: '상품이름A',
      price: 35000,
      image: 'https://picsum.photos/128/128',
      stock: 10,
    },
  },
  {
    cartItemId: '2',
    quantity: 1,
    product: {
      productId: 'b',
      name: '상품이름B',
      price: 25000,
      image: 'https://picsum.photos/128/128',
      stock: 5,
    },
  },
];

describe('CartPage', () => {
  it('장바구니 페이지에 진입하면 `GET /cart` API를 호출한다', async () => {
    const requestCart = jest.fn();

    server.use(
      http.get('/cart', () => {
        requestCart();

        return HttpResponse.json({
          status: 'success',
          data: [],
        });
      }),
    );

    render(<CartPage />);

    await waitFor(() => {
      expect(requestCart).toHaveBeenCalled();
    });
  });

  it('조회한 상품의 이름, 이미지, 가격, 수량을 표시한다', async () => {
    server.use(
      http.get('/cart', () => {
        return HttpResponse.json({
          status: 'success',
          data: mockCartItems,
        });
      }),
    );

    render(<CartPage />);

    expect(await screen.findByText('상품이름A')).toBeInTheDocument();
    expect(screen.getByText('상품이름B')).toBeInTheDocument();

    expect(screen.getAllByRole('img')).toHaveLength(2);

    expect(screen.getByText(/35,?000/)).toBeInTheDocument();
    expect(screen.getByText(/25,?000/)).toBeInTheDocument();

    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
  });

  it('진입 시 모든 상품을 선택된 상태로 표시한다', async () => {
    server.use(
      http.get('/cart', () => {
        return HttpResponse.json({
          status: 'success',
          data: mockCartItems,
        });
      }),
    );

    localStorage.clear();

    render(<CartPage />);

    await screen.findByText('상품이름A');

    const checkboxes = screen.getAllByRole('checkbox');

    expect(checkboxes.length).toBeGreaterThan(0);

    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked();
    });
  });

  it('장바구니가 비어 있으면 빈 장바구니 UI를 표시한다', async () => {
    server.use(
      http.get('/cart', () => {
        return HttpResponse.json({
          status: 'success',
          data: [],
        });
      }),
    );

    render(<CartPage />);

    expect(await screen.findByText('장바구니에 담은 상품이 없습니다.')).toBeInTheDocument();
  });
});
