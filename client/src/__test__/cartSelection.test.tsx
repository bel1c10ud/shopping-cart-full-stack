import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { server } from '../mocks/server';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../hooks/useCalculateCartAmount';
import type { CartItem } from '../types';
import { getCartHandler, updateCartQuantityHandler } from './cartHandlers';
import { createCartItems, renderCartPage } from './cartTestUtils';

describe('CartPage 선택과 금액 계산', () => {
  let mockCartItems: CartItem[];

  beforeEach(() => {
    mockCartItems = createCartItems();
    server.use(getCartHandler(mockCartItems));
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
    localStorage.clear();

    renderCartPage();

    await screen.findByText('상품이름A');

    const checkboxes = screen.getAllByRole('checkbox');

    expect(checkboxes.length).toBeGreaterThan(0);

    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked();
    });
  });

  it('개별 상품을 선택하거나 선택 해제할 수 있다', async () => {
    localStorage.clear();

    renderCartPage();

    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const checkboxA = within(itemA).getByRole('checkbox');
    const itemB = screen.getByText('상품이름B').closest('li')!;
    const checkboxB = within(itemB).getByRole('checkbox');

    expect(checkboxA).toBeChecked();
    expect(checkboxB).toBeChecked();

    fireEvent.click(checkboxA);
    expect(checkboxA).not.toBeChecked();
    expect(checkboxB).toBeChecked();

    fireEvent.click(checkboxA);
    expect(checkboxA).toBeChecked();
  });

  it('전체 상품을 한 번에 선택하거나 선택 해제할 수 있다', async () => {
    localStorage.clear();

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
    expect(selectAllCheckbox).not.toBeChecked();
    expect(checkboxA).not.toBeChecked();
    expect(checkboxB).not.toBeChecked();

    fireEvent.click(selectAllCheckbox);
    expect(selectAllCheckbox).toBeChecked();
    expect(checkboxA).toBeChecked();
    expect(checkboxB).toBeChecked();
  });

  it('상품 선택 여부는 새로고침 후에도 유지한다', async () => {
    localStorage.clear();

    const { unmount } = renderCartPage();

    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const checkboxA = within(itemA).getByRole('checkbox');

    fireEvent.click(checkboxA);
    expect(checkboxA).not.toBeChecked();

    unmount();
    renderCartPage();

    await screen.findByText('상품이름A');

    const itemARefreshed = screen.getByText('상품이름A').closest('li')!;
    const checkboxARefreshed = within(itemARefreshed).getByRole('checkbox');
    const itemBRefreshed = screen.getByText('상품이름B').closest('li')!;
    const checkboxBRefreshed = within(itemBRefreshed).getByRole('checkbox');

    expect(checkboxARefreshed).not.toBeChecked();
    expect(checkboxBRefreshed).toBeChecked();
  });

  it(`선택된 상품의 가격과 수량을 기준으로 결제 금액을 계산한다 (${FREE_SHIPPING_THRESHOLD.toLocaleString()}원 미만 시 배송비 ${SHIPPING_FEE.toLocaleString()}원)`, async () => {
    localStorage.clear();

    renderCartPage();

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
        quantity: 3,
      },
    ];

    server.use(getCartHandler(expensiveCartItems));

    localStorage.clear();

    renderCartPage();

    await screen.findByText('상품이름A');

    expect(screen.getByLabelText('주문 금액')).toHaveAttribute('data-value', '105000');
    expect(screen.getByLabelText('배송비')).toHaveAttribute('data-value', '0');
    expect(screen.getByLabelText('총 결제 금액')).toHaveAttribute('data-value', '105000');
  });

  it('상품 선택 또는 수량 변경 시 결제 금액을 즉시 갱신한다', async () => {
    const patchHandler = vi.fn();

    server.use(
      updateCartQuantityHandler(
        mockCartItems,
        (cartItems) => {
          mockCartItems = cartItems;
        },
        patchHandler,
      ),
    );

    localStorage.clear();

    renderCartPage();

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
    localStorage.clear();

    renderCartPage();

    await screen.findByText('상품이름A');

    const checkoutButton = screen.getByRole('button', { name: '주문 확인' });
    expect(checkoutButton).toBeEnabled();

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(selectAllCheckbox);
    expect(checkoutButton).toBeDisabled();

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const checkboxA = within(itemA).getByRole('checkbox');
    fireEvent.click(checkboxA);
    expect(checkoutButton).toBeEnabled();
  });
});
