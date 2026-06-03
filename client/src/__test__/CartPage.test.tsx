import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
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
    const requestCart = vi.fn();

    server.use(
      http.get(`${import.meta.env.VITE_API_URL}/cart`, () => {
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
      http.get(`${import.meta.env.VITE_API_URL}/cart`, () => {
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

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('진입 시 모든 상품을 선택된 상태로 표시한다', async () => {
    server.use(
      http.get(`${import.meta.env.VITE_API_URL}/cart`, () => {
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
      http.get(`${import.meta.env.VITE_API_URL}/cart`, () => {
        return HttpResponse.json({
          status: 'success',
          data: [],
        });
      }),
    );

    render(<CartPage />);

    expect(await screen.findByText('장바구니에 담은 상품이 없습니다.')).toBeInTheDocument();
  });

  it('개별 상품을 선택하거나 선택 해제할 수 있다', async () => {
    server.use(
      http.get(`${import.meta.env.VITE_API_URL}/cart`, () => {
        return HttpResponse.json({
          status: 'success',
          data: mockCartItems,
        });
      }),
    );

    localStorage.clear();

    render(<CartPage />);

    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const checkboxA = within(itemA).getByRole('checkbox');

    expect(checkboxA).toBeChecked();

    fireEvent.click(checkboxA);
    expect(checkboxA).not.toBeChecked();

    fireEvent.click(checkboxA);
    expect(checkboxA).toBeChecked();
  });

  it('전체 상품을 한 번에 선택하거나 선택 해제할 수 있다', async () => {
    server.use(
      http.get(`${import.meta.env.VITE_API_URL}/cart`, () => {
        return HttpResponse.json({
          status: 'success',
          data: mockCartItems,
        });
      }),
    );

    localStorage.clear();

    render(<CartPage />);

    await screen.findByText('상품이름A');

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    const itemA = screen.getByText('상품이름A').closest('li')!;
    const checkboxA = within(itemA).getByRole('checkbox');
    const itemB = screen.getByText('상품이름B').closest('li')!;
    const checkboxB = within(itemB).getByRole('checkbox');

    expect(selectAllCheckbox).toBeChecked();
    expect(checkboxA).toBeChecked();
    expect(checkboxB).toBeChecked();

    fireEvent.click(selectAllCheckbox);
    expect(selectAllCheckbox).not.toBeChecked();
    expect(checkboxA).not.toBeChecked();
    expect(checkboxB).not.toBeChecked();

    fireEvent.click(selectAllCheckbox);
    expect(selectAllCheckbox).toBeChecked();
    expect(checkboxA).toBeChecked();
    expect(checkboxB).toBeChecked();
  });

  it('상품 선택 여부는 새로고침 후에도 유지한다', async () => {
    server.use(
      http.get(`${import.meta.env.VITE_API_URL}/cart`, () => {
        return HttpResponse.json({
          status: 'success',
          data: mockCartItems,
        });
      }),
    );

    localStorage.clear();

    const { unmount } = render(<CartPage />);

    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const checkboxA = within(itemA).getByRole('checkbox');

    fireEvent.click(checkboxA);
    expect(checkboxA).not.toBeChecked();

    unmount();
    render(<CartPage />);

    await screen.findByText('상품이름A');

    const itemA_refreshed = screen.getByText('상품이름A').closest('li')!;
    const checkboxA_refreshed = within(itemA_refreshed).getByRole('checkbox');
    const itemB_refreshed = screen.getByText('상품이름B').closest('li')!;
    const checkboxB_refreshed = within(itemB_refreshed).getByRole('checkbox');

    expect(checkboxA_refreshed).not.toBeChecked();
    expect(checkboxB_refreshed).toBeChecked();
  });
});
