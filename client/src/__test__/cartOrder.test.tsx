import { fireEvent, screen } from '@testing-library/react';
import { server } from '../mocks/server';
import { SHIPPING_FEE } from '../hooks/useCalculateCartAmount';
import type { CartItem } from '../types';
import { getCartHandler } from './cartHandlers';
import { createCartItems, renderCartPage } from './cartTestUtils';

describe('CartPage 주문 이동', () => {
  let mockCartItems: CartItem[];

  beforeEach(() => {
    mockCartItems = createCartItems();
    server.use(getCartHandler(mockCartItems));
  });

  it('주문 확인 버튼을 누르면 주문 확인 페이지로 이동하고 관련 내용(종류 수, 총수량, 총 결제 금액, 결제하기 버튼)을 표시한다', async () => {
    localStorage.clear();

    renderCartPage();

    await screen.findByText('상품이름A');

    const checkoutButton = screen.getByRole('button', { name: '주문 확인' });
    fireEvent.click(checkoutButton);

    expect(await screen.findByText(/2종류/)).toBeInTheDocument();
    expect(screen.getByText(/3개/)).toBeInTheDocument();

    const orderAmount = 95_000;
    const totalAmountText = (orderAmount + SHIPPING_FEE).toLocaleString().replace(',', ',?');

    expect(screen.getByText(new RegExp(`${totalAmountText}원?`))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '결제하기' })).toBeInTheDocument();
  });

  it('주문 확인 페이지에서 뒤로가기 버튼을 누르면 장바구니 페이지로 이동한다', async () => {
    localStorage.clear();

    renderCartPage();

    await screen.findByText('상품이름A');

    const checkoutButton = screen.getByRole('button', { name: '주문 확인' });
    fireEvent.click(checkoutButton);

    const backButton = await screen.findByRole('link', { name: '뒤로가기' });
    fireEvent.click(backButton);

    expect(await screen.findByText('상품이름A')).toBeInTheDocument();
  });
});
