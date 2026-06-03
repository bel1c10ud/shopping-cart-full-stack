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

  it('선택된 상품의 가격과 수량을 기준으로 결제 금액을 계산한다 (100,000원 미만 시 배송비 3,000원)', async () => {
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

    // 총 상품금액 95,000원 (< 10만원) -> 배송비 3,000원 적용
    expect(screen.getByTestId('subtotalAmount')).toHaveAttribute('data-value', '95000');
    expect(screen.getByTestId('shippingAmount')).toHaveAttribute('data-value', '3000');
    expect(screen.getByTestId('totalAmount')).toHaveAttribute('data-value', '98000');
  });

  it('결제 금액이 100,000원 이상이면 배송비를 무료(0원)로 표시한다', async () => {
    const expensiveCartItems = [
      {
        ...mockCartItems[0],
        quantity: 3, // 35,000원 * 3 = 105,000원
      },
    ];

    server.use(
      http.get(`${import.meta.env.VITE_API_URL}/cart`, () => {
        return HttpResponse.json({
          status: 'success',
          data: expensiveCartItems,
        });
      }),
    );

    localStorage.clear();

    render(<CartPage />);

    await screen.findByText('상품이름A');

    // 총 상품금액 105,000원 (>= 10만원) -> 배송비 무료 (0원)
    expect(screen.getByTestId('subtotalAmount')).toHaveAttribute('data-value', '105000');
    expect(screen.getByTestId('shippingAmount')).toHaveAttribute('data-value', '0');
    expect(screen.getByTestId('totalAmount')).toHaveAttribute('data-value', '105000');
  });

  it('상품 선택 또는 수량 변경 시 결제 금액을 즉시 갱신한다', async () => {
    server.use(
      http.get(`${import.meta.env.VITE_API_URL}/cart`, () => {
        return HttpResponse.json({
          status: 'success',
          data: mockCartItems,
        });
      }),
    );

    const patchHandler = vi.fn();
    server.use(
      http.patch(`${import.meta.env.VITE_API_URL}/cart/1`, () => {
        patchHandler();
        return HttpResponse.json({
          status: 'success',
          data: {
            ...mockCartItems[0],
            quantity: 3,
          },
        });
      }),
    );

    localStorage.clear();

    render(<CartPage />);

    await screen.findByText('상품이름A');

    // 초기 상태: 95,000원 + 3,000원 = 98,000원
    expect(screen.getByTestId('totalAmount')).toHaveAttribute('data-value', '98000');

    const itemB = screen.getByText('상품이름B').closest('li')!;
    const checkboxB = within(itemB).getByRole('checkbox');

    // 1. 상품B 선택 해제 -> 상품A(70,000원)만 선택 (< 10만원) -> 배송비 3,000원 적용
    fireEvent.click(checkboxB);
    expect(screen.getByTestId('subtotalAmount')).toHaveAttribute('data-value', '70000');
    expect(screen.getByTestId('totalAmount')).toHaveAttribute('data-value', '73000');

    // 2. 수량 변경 -> 상품A 3개(105,000원)로 변경 (>= 10만원) -> 배송비 무료(0원)
    const itemA = screen.getByText('상품이름A').closest('li')!;
    const plusButton = within(itemA).getByRole('button', { name: '+' });

    fireEvent.click(plusButton);

    await waitFor(() => {
      expect(patchHandler).toHaveBeenCalled();
    });

    expect(screen.getByTestId('subtotalAmount')).toHaveAttribute('data-value', '105000');
    expect(screen.getByTestId('shippingAmount')).toHaveAttribute('data-value', '0');
    expect(screen.getByTestId('totalAmount')).toHaveAttribute('data-value', '105000');
  });
});
