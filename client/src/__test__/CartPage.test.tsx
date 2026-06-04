import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import CartPage from '../pages/CartPage';
import { server } from '../mocks/server';
import type { CartItem } from '../types';
import { MemoryRouter, Route, Routes } from 'react-router';
import OrderPage from '../pages/OrderPage';
import { CART_SELECT_LOCAL_STORAGE_KEY } from '../hooks/useCartItemSelection';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../hooks/useCalculateCartAmount';

describe('CartPage', () => {
  let mockCartItems: CartItem[];

  beforeEach(() => {
    mockCartItems = [
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
  });

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

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );

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

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );

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

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );

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

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );

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

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const checkboxA = within(itemA).getByRole('checkbox');
    const itemB = screen.getByText('상품이름B').closest('li')!;
    const checkboxB = within(itemB).getByRole('checkbox');

    // 1. 진입 시에는 모든 상품이 기본적으로 선택되어 있음
    expect(checkboxA).toBeChecked();
    expect(checkboxB).toBeChecked();

    // 2. 상품A 클릭 시 선택 해제 검증
    fireEvent.click(checkboxA);
    expect(checkboxA).not.toBeChecked();
    expect(checkboxB).toBeChecked();

    // 3. 상품A 다시 클릭 시 재선택 검증
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

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText('상품이름A');

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    const itemA = screen.getByText('상품이름A').closest('li')!;
    const checkboxA = within(itemA).getByRole('checkbox');
    const itemB = screen.getByText('상품이름B').closest('li')!;
    const checkboxB = within(itemB).getByRole('checkbox');

    // 1. 초기 상태: 전체선택 및 개별 상품 모두 선택되어 있음
    expect(selectAllCheckbox).toBeChecked();
    expect(checkboxA).toBeChecked();
    expect(checkboxB).toBeChecked();

    // 2. 전체선택 해제 시 모든 개별 상품도 함께 해제 검증
    fireEvent.click(selectAllCheckbox);
    expect(selectAllCheckbox).not.toBeChecked();
    expect(checkboxA).not.toBeChecked();
    expect(checkboxB).not.toBeChecked();

    // 3. 전체선택 재활성화 시 모든 개별 상품도 재선택 검증
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

    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const checkboxA = within(itemA).getByRole('checkbox');

    // 1. 상품A 선택 해제
    fireEvent.click(checkboxA);
    expect(checkboxA).not.toBeChecked();

    // 2. 언마운트 후 다시 렌더링(새로고침 상황 모사)
    unmount();
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText('상품이름A');

    const itemA_refreshed = screen.getByText('상품이름A').closest('li')!;
    const checkboxA_refreshed = within(itemA_refreshed).getByRole('checkbox');
    const itemB_refreshed = screen.getByText('상품이름B').closest('li')!;
    const checkboxB_refreshed = within(itemB_refreshed).getByRole('checkbox');

    // 3. 상품A는 해제 상태, 상품B는 선택 상태가 유지되는지 검증
    expect(checkboxA_refreshed).not.toBeChecked();
    expect(checkboxB_refreshed).toBeChecked();
  });

  it(`선택된 상품의 가격과 수량을 기준으로 결제 금액을 계산한다 (${FREE_SHIPPING_THRESHOLD.toLocaleString()}원 미만 시 배송비 ${SHIPPING_FEE.toLocaleString()}원)`, async () => {
    server.use(
      http.get(`${import.meta.env.VITE_API_URL}/cart`, () => {
        return HttpResponse.json({
          status: 'success',
          data: mockCartItems,
        });
      }),
    );

    localStorage.clear();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText('상품이름A');

    const orderAmount = 95_000;
    const totalAmount = orderAmount + SHIPPING_FEE;

    expect(screen.getByLabelText('주문 금액')).toHaveAttribute('data-value', orderAmount.toString());
    expect(screen.getByLabelText('배송비')).toHaveAttribute('data-value', SHIPPING_FEE.toString());
    expect(screen.getByLabelText('총 결제 금액')).toHaveAttribute('data-value', totalAmount.toString());
  });

  it(`결제 금액이 ${FREE_SHIPPING_THRESHOLD.toLocaleString()}원 이상이면 배송비를 무료(0원)로 표시한다`, async () => {
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

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText('상품이름A');

    // 총 상품금액 105,000원 (>= 10만원) -> 배송비 무료 (0원)
    expect(screen.getByLabelText('주문 금액')).toHaveAttribute('data-value', '105000');
    expect(screen.getByLabelText('배송비')).toHaveAttribute('data-value', '0');
    expect(screen.getByLabelText('총 결제 금액')).toHaveAttribute('data-value', '105000');
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
      http.patch(`${import.meta.env.VITE_API_URL}/cart/:cartItemId`, async ({ request, params }) => {
        patchHandler();
        const { cartItemId } = params;
        const body = (await request.json()) as { quantity: number };

        mockCartItems = mockCartItems.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: body.quantity } : item,
        );

        const updatedItem = mockCartItems.find((item) => item.cartItemId === cartItemId);

        return HttpResponse.json({
          status: 'success',
          data: updatedItem,
        });
      }),
    );

    localStorage.clear();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText('상품이름A');

    const initialOrderAmount = 95_000;
    const initialTotalAmount = initialOrderAmount + SHIPPING_FEE;

    expect(screen.getByLabelText('총 결제 금액')).toHaveAttribute('data-value', initialTotalAmount.toString());

    const itemB = screen.getByText('상품이름B').closest('li')!;
    const checkboxB = within(itemB).getByRole('checkbox');

    fireEvent.click(checkboxB);
    const selectedOrderAmount = 70_000;
    const selectedTotalAmount = selectedOrderAmount + SHIPPING_FEE;

    expect(screen.getByLabelText('주문 금액')).toHaveAttribute('data-value', selectedOrderAmount.toString());
    expect(screen.getByLabelText('총 결제 금액')).toHaveAttribute('data-value', selectedTotalAmount.toString());

    // 2. 수량 변경 -> 상품A 3개(105,000원)로 변경 (>= 10만원) -> 배송비 무료(0원)
    const itemA = screen.getByText('상품이름A').closest('li')!;
    const plusButton = within(itemA).getByRole('button', { name: '+' });

    fireEvent.click(plusButton);

    await waitFor(() => {
      expect(patchHandler).toHaveBeenCalled();
    });

    expect(screen.getByLabelText('주문 금액')).toHaveAttribute('data-value', '105000');
    expect(screen.getByLabelText('배송비')).toHaveAttribute('data-value', '0');
    expect(screen.getByLabelText('총 결제 금액')).toHaveAttribute('data-value', '105000');
  });

  it('장바구니 상품의 수량을 변경할 수 있다', async () => {
    server.use(
      http.get(`${import.meta.env.VITE_API_URL}/cart`, () => {
        return HttpResponse.json({
          status: 'success',
          data: mockCartItems,
        });
      }),
    );

    server.use(
      http.patch(`${import.meta.env.VITE_API_URL}/cart/:cartItemId`, async ({ request, params }) => {
        const { cartItemId } = params;
        const body = (await request.json()) as { quantity: number };

        mockCartItems = mockCartItems.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: body.quantity } : item,
        );

        const updatedItem = mockCartItems.find((item) => item.cartItemId === cartItemId);

        return HttpResponse.json({
          status: 'success',
          data: updatedItem,
        });
      }),
    );

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const plusButton = within(itemA).getByRole('button', { name: '+' });

    fireEvent.click(plusButton);

    expect(await within(itemA).findByText('3')).toBeInTheDocument();
  });

  it('수량은 1개 이상 99개 이하로 제한한다', async () => {
    // 1. 수량이 1일 때 - 버튼 비활성화 확인
    mockCartItems[0].quantity = 1;
    server.use(
      http.get(`${import.meta.env.VITE_API_URL}/cart`, () => {
        return HttpResponse.json({
          status: 'success',
          data: mockCartItems,
        });
      }),
    );

    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const minusButton = within(itemA).getByRole('button', { name: '-' });
    expect(minusButton).toBeDisabled();

    // 2. 수량이 99일 때 + 버튼 비활성화 확인
    unmount();

    mockCartItems[0].quantity = 99;

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText('상품이름A');

    const itemA_99 = screen.getByText('상품이름A').closest('li')!;
    const plusButton = within(itemA_99).getByRole('button', { name: '+' });
    expect(plusButton).toBeDisabled();
  });

  it('수량 변경 시 PATCH /cart/:cartItemId API를 호출한다', async () => {
    const patchSpy = vi.fn();
    server.use(
      http.get(`${import.meta.env.VITE_API_URL}/cart`, () => {
        return HttpResponse.json({
          status: 'success',
          data: mockCartItems,
        });
      }),
    );

    server.use(
      http.patch(`${import.meta.env.VITE_API_URL}/cart/:cartItemId`, ({ params }) => {
        patchSpy(params.cartItemId);
        return HttpResponse.json({
          status: 'success',
          data: {
            ...mockCartItems[0],
            quantity: 3,
          },
        });
      }),
    );

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const plusButton = within(itemA).getByRole('button', { name: '+' });

    fireEvent.click(plusButton);

    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalledWith('1');
    });
  });

  it('API 요청에 실패하면 사용자에게 에러 메시지를 표시한다', async () => {
    server.use(
      http.get(`${import.meta.env.VITE_API_URL}/cart`, () => {
        return HttpResponse.json({
          status: 'success',
          data: mockCartItems,
        });
      }),
    );

    server.use(
      http.patch(`${import.meta.env.VITE_API_URL}/cart/1`, () => {
        return new HttpResponse(null, { status: 400 });
      }),
    );

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const plusButton = within(itemA).getByRole('button', { name: '+' });

    fireEvent.click(plusButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalled();
    });

    alertMock.mockRestore();
  });

  it('장바구니 상품을 제거할 수 있다', async () => {
    server.use(
      http.get(`${import.meta.env.VITE_API_URL}/cart`, () => {
        return HttpResponse.json({
          status: 'success',
          data: mockCartItems,
        });
      }),
    );

    server.use(
      http.delete(`${import.meta.env.VITE_API_URL}/cart/:cartItemId`, ({ params }) => {
        const { cartItemId } = params;

        mockCartItems = mockCartItems.filter((item) => item.cartItemId !== cartItemId);

        return HttpResponse.json({
          status: 'success',
          data: { cartItemId },
        });
      }),
    );

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const deleteButton = within(itemA).getByRole('button', { name: '삭제' });

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('상품이름A')).not.toBeInTheDocument();
    });
  });

  it('제거 시 DELETE /cart/:cartItemId API를 호출한다', async () => {
    const deleteSpy = vi.fn();
    server.use(
      http.get(`${import.meta.env.VITE_API_URL}/cart`, () => {
        return HttpResponse.json({
          status: 'success',
          data: mockCartItems,
        });
      }),
    );

    server.use(
      http.delete(`${import.meta.env.VITE_API_URL}/cart/:cartItemId`, ({ params }) => {
        deleteSpy(params.cartItemId);
        return HttpResponse.json({
          status: 'success',
          data: params.cartItemId,
        });
      }),
    );

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const deleteButton = within(itemA).getByRole('button', { name: '삭제' });

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith('1');
    });
  });

  it('제거된 상품을 화면과 선택 상태에서 제거하고 선택 정보도 함께 제거한다', async () => {
    server.use(
      http.get(`${import.meta.env.VITE_API_URL}/cart`, () => {
        return HttpResponse.json({
          status: 'success',
          data: mockCartItems,
        });
      }),
    );

    server.use(
      http.delete(`${import.meta.env.VITE_API_URL}/cart/:cartItemId`, ({ params }) => {
        const { cartItemId } = params;
        mockCartItems = mockCartItems.filter((item) => item.cartItemId !== cartItemId);
        return HttpResponse.json({
          status: 'success',
          data: { cartItemId },
        });
      }),
    );

    localStorage.clear();
    localStorage.setItem(CART_SELECT_LOCAL_STORAGE_KEY, JSON.stringify({ '1': true, '2': true }));

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const deleteButton = within(itemA).getByRole('button', { name: '삭제' });

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('상품이름A')).not.toBeInTheDocument();
    });

    const stored = JSON.parse(localStorage.getItem(CART_SELECT_LOCAL_STORAGE_KEY) || '{}');
    expect(stored['1']).toBeUndefined();
    expect(stored['2']).toBe(true);
  });

  it('제거 API 요청에 실패하면 사용자에게 에러 메시지를 표시한다', async () => {
    server.use(
      http.get(`${import.meta.env.VITE_API_URL}/cart`, () => {
        return HttpResponse.json({
          status: 'success',
          data: mockCartItems,
        });
      }),
    );

    server.use(
      http.delete(`${import.meta.env.VITE_API_URL}/cart/:cartItemId`, () => {
        return new HttpResponse(null, { status: 400 });
      }),
    );

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const deleteButton = within(itemA).getByRole('button', { name: '삭제' });

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalled();
    });

    alertMock.mockRestore();
  });

  it('선택된 상품이 있으면 주문 확인 버튼을 활성화하고 없으면 비활성화한다', async () => {
    server.use(
      http.get(`${import.meta.env.VITE_API_URL}/cart`, () => {
        return HttpResponse.json({
          status: 'success',
          data: mockCartItems,
        });
      }),
    );

    localStorage.clear();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText('상품이름A');

    const checkoutButton = screen.getByRole('button', { name: '주문 확인' });
    expect(checkoutButton).toBeEnabled();

    // 전체 선택 해제 시 비활성화
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(selectAllCheckbox);
    expect(checkoutButton).toBeDisabled();

    // 개별 상품 하나 다시 선택 시 활성화
    const itemA = screen.getByText('상품이름A').closest('li')!;
    const checkboxA = within(itemA).getByRole('checkbox');
    fireEvent.click(checkboxA);
    expect(checkoutButton).toBeEnabled();
  });

  it('주문 확인 버튼을 누르면 주문 확인 페이지로 이동하고 관련 내용(종류 수, 총수량, 총 결제 금액, 결제하기 버튼)을 표시한다', async () => {
    server.use(
      http.get(`${import.meta.env.VITE_API_URL}/cart`, () => {
        return HttpResponse.json({
          status: 'success',
          data: mockCartItems,
        });
      }),
    );

    localStorage.clear();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText('상품이름A');

    const checkoutButton = screen.getByRole('button', { name: '주문 확인' });
    fireEvent.click(checkoutButton);

    // 주문할 상품 종류 수 (2종류)와 총수량 (3개) 표시 검증
    expect(await screen.findByText(/2종류/)).toBeInTheDocument();
    expect(screen.getByText(/3개/)).toBeInTheDocument();

    const orderAmount = 95_000;
    const totalAmountText = (orderAmount + SHIPPING_FEE).toLocaleString().replace(',', ',?');

    expect(screen.getByText(new RegExp(`${totalAmountText}원?`))).toBeInTheDocument();

    // 결제하기 버튼 표시 검증
    expect(screen.getByRole('button', { name: '결제하기' })).toBeInTheDocument();
  });

  it('주문 확인 페이지에서 뒤로가기 버튼을 누르면 장바구니 페이지로 이동한다', async () => {
    server.use(
      http.get(`${import.meta.env.VITE_API_URL}/cart`, () => {
        return HttpResponse.json({
          status: 'success',
          data: mockCartItems,
        });
      }),
    );

    localStorage.clear();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText('상품이름A');

    const checkoutButton = screen.getByRole('button', { name: '주문 확인' });
    fireEvent.click(checkoutButton);

    const backButton = await screen.findByRole('button', { name: '뒤로가기' });
    fireEvent.click(backButton);

    expect(await screen.findByText('상품이름A')).toBeInTheDocument();
  });
});
