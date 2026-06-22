import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { server } from '../mocks/server';
import type { CartItem } from '../types';
import { calculateCartAmount, getCartAmountHandler, getCartHandler, updateCartItemHandler } from './cartHandlers';
import { createCartItems, renderCartPage } from './cartTestUtils';

describe('CartPage 선택과 금액 계산', () => {
  let mockCartItems: CartItem[];

  beforeEach(() => {
    mockCartItems = createCartItems();
    server.use(getCartHandler(mockCartItems), getCartAmountHandler(calculateCartAmount(mockCartItems)));
  });

  it('장바구니 페이지에 진입하면 `GET /cart` API를 호출한다', async () => {
    const requestCart = vi.fn();

    server.use(getCartHandler([], requestCart));

    renderCartPage();

    await waitFor(() => {
      expect(requestCart).toHaveBeenCalled();
    });
  });

  it('조회한 상품의 이름, 이미지, 가격, 수량을 표시한다', async () => {
    renderCartPage();

    const itemA = (await screen.findByText('상품이름A')).closest('li')!;
    const itemB = screen.getByText('상품이름B').closest('li')!;

    expect(within(itemA).getByRole('img')).toHaveAttribute('src', mockCartItems[0].product.image);
    expect(within(itemA).getByText(/35,?000/)).toBeInTheDocument();
    expect(within(itemA).getByText('2')).toBeInTheDocument();

    expect(within(itemB).getByRole('img')).toHaveAttribute('src', mockCartItems[1].product.image);
    expect(within(itemB).getByText(/25,?000/)).toBeInTheDocument();
    expect(within(itemB).getByText('1')).toBeInTheDocument();
  });

  it('장바구니가 비어 있으면 빈 장바구니 UI를 표시한다', async () => {
    server.use(getCartHandler([]));

    renderCartPage();

    expect(await screen.findByText('장바구니에 담은 상품이 없습니다.')).toBeInTheDocument();
  });

  it('진입 시 모든 상품을 선택된 상태로 표시한다', async () => {
    renderCartPage();

    await screen.findByText('상품이름A');

    const checkboxes = screen.getAllByRole('checkbox');

    expect(checkboxes.length).toBeGreaterThan(0);

    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked();
    });
  });

  it('개별 상품을 선택하거나 선택 해제할 수 있다', async () => {
    server.use(
      updateCartItemHandler(mockCartItems, (cartItems) => {
        mockCartItems = cartItems;
        server.use(getCartHandler(mockCartItems), getCartAmountHandler(calculateCartAmount(mockCartItems)));
      }),
    );

    renderCartPage();

    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const checkboxA = within(itemA).getByRole('checkbox');
    const itemB = screen.getByText('상품이름B').closest('li')!;
    const checkboxB = within(itemB).getByRole('checkbox');

    expect(checkboxA).toBeChecked();
    expect(checkboxB).toBeChecked();

    fireEvent.click(checkboxA);
    await waitFor(() => {
      expect(checkboxA).not.toBeChecked();
    });
    expect(checkboxB).toBeChecked();

    fireEvent.click(checkboxA);
    await waitFor(() => {
      expect(checkboxA).toBeChecked();
    });
  });

  it('전체 상품을 한 번에 선택하거나 선택 해제할 수 있다', async () => {
    server.use(
      updateCartItemHandler(mockCartItems, (cartItems) => {
        mockCartItems = cartItems;
        server.use(getCartHandler(mockCartItems), getCartAmountHandler(calculateCartAmount(mockCartItems)));
      }),
    );

    renderCartPage();

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
    await waitFor(() => {
      expect(selectAllCheckbox).not.toBeChecked();
      expect(checkboxA).not.toBeChecked();
      expect(checkboxB).not.toBeChecked();
    });

    fireEvent.click(selectAllCheckbox);
    await waitFor(() => {
      expect(selectAllCheckbox).toBeChecked();
      expect(checkboxA).toBeChecked();
      expect(checkboxB).toBeChecked();
    });
  });

  it('상품 선택 여부는 서버 응답 기준으로 표시한다', async () => {
    mockCartItems[0].isSelected = false;
    server.use(getCartHandler(mockCartItems), getCartAmountHandler(calculateCartAmount(mockCartItems)));

    renderCartPage();

    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const checkboxA = within(itemA).getByRole('checkbox');
    const itemB = screen.getByText('상품이름B').closest('li')!;
    const checkboxB = within(itemB).getByRole('checkbox');

    expect(checkboxA).not.toBeChecked();
    expect(checkboxB).toBeChecked();
  });

  it('장바구니 결제 금액 API를 호출하고 서버가 계산한 금액을 표시한다', async () => {
    const requestCartAmount = vi.fn();
    server.use(
      getCartAmountHandler(
        {
          orderAmount: 95000,
          shippingAmount: 3000,
          discountAmount: 0,
          totalAmount: 98000,
        },
        requestCartAmount,
      ),
    );

    renderCartPage();

    await screen.findByText('상품이름A');

    await waitFor(() => {
      expect(requestCartAmount).toHaveBeenCalled();
    });

    expect(screen.getByLabelText('주문 금액')).toHaveAttribute('data-value', '95000');
    expect(screen.getByLabelText('배송비')).toHaveAttribute('data-value', '3000');
    expect(screen.getByLabelText('총 결제 금액')).toHaveAttribute('data-value', '98000');
  });

  it('서버가 무료 배송으로 계산한 금액을 표시한다', async () => {
    const expensiveCartItems = [
      {
        ...mockCartItems[0],
        quantity: 3,
      },
    ];

    server.use(getCartHandler(expensiveCartItems), getCartAmountHandler(calculateCartAmount(expensiveCartItems)));

    renderCartPage();

    await screen.findByText('상품이름A');

    expect(screen.getByLabelText('주문 금액')).toHaveAttribute('data-value', '105000');
    expect(screen.getByLabelText('배송비')).toHaveAttribute('data-value', '0');
    expect(screen.getByLabelText('총 결제 금액')).toHaveAttribute('data-value', '105000');
  });

  it('상품 선택 또는 수량 변경 시 결제 금액을 즉시 갱신한다', async () => {
    const patchHandler = vi.fn();

    server.use(
      updateCartItemHandler(
        mockCartItems,
        (cartItems) => {
          mockCartItems = cartItems;
          server.use(getCartHandler(mockCartItems), getCartAmountHandler(calculateCartAmount(mockCartItems)));
        },
        patchHandler,
      ),
    );

    renderCartPage();

    await screen.findByText('상품이름A');

    expect(screen.getByLabelText('총 결제 금액')).toHaveAttribute('data-value', '98000');

    const itemB = screen.getByText('상품이름B').closest('li')!;
    const checkboxB = within(itemB).getByRole('checkbox');

    fireEvent.click(checkboxB);
    await waitFor(() => {
      expect(screen.getByLabelText('주문 금액')).toHaveAttribute('data-value', '70000');
      expect(screen.getByLabelText('총 결제 금액')).toHaveAttribute('data-value', '73000');
    });

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

  it('선택된 상품이 있으면 주문 확인 버튼을 활성화하고 없으면 비활성화한다', async () => {
    server.use(
      updateCartItemHandler(mockCartItems, (cartItems) => {
        mockCartItems = cartItems;
        server.use(getCartHandler(mockCartItems), getCartAmountHandler(calculateCartAmount(mockCartItems)));
      }),
    );

    renderCartPage();

    await screen.findByText('상품이름A');

    const checkoutButton = screen.getByRole('button', { name: '주문 확인' });
    expect(checkoutButton).toBeEnabled();

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(selectAllCheckbox);
    await waitFor(() => {
      expect(checkoutButton).toBeDisabled();
    });

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const checkboxA = within(itemA).getByRole('checkbox');
    fireEvent.click(checkboxA);
    await waitFor(() => {
      expect(checkoutButton).toBeEnabled();
    });
  });
});
