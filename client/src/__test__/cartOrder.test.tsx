import { fireEvent, screen } from '@testing-library/react';
import { server } from '../mocks/server';
import type { CartItem } from '../types';
import { getCartHandler } from './cartHandlers';
import { createCartItems, renderCartPage } from './cartTestUtils';
import { createOrder, createOrderHandler, getOrderHandler } from './orderHandlers';
import { CART_SELECT_LOCAL_STORAGE_KEY } from '../hooks/useCartItemSelection';

describe('CartPage 주문 이동', () => {
  let mockCartItems: CartItem[];

  beforeEach(() => {
    mockCartItems = createCartItems();
    const order = createOrder();
    server.use(getCartHandler(mockCartItems), createOrderHandler(order), getOrderHandler(order));
  });

  it('주문 확인 버튼을 누르면 주문 생성 API를 호출하고 주문 확인 페이지로 이동한다', async () => {
    localStorage.clear();

    renderCartPage();

    await screen.findByText('상품이름A');

    const checkoutButton = screen.getByRole('button', { name: '주문 확인' });
    fireEvent.click(checkoutButton);

    expect(await screen.findByRole('button', { name: '결제하기' })).toBeInTheDocument();
    expect(screen.getByText(/2종류/)).toBeInTheDocument();
    expect(screen.getByText(/3개/)).toBeInTheDocument();
    expect(screen.getByText(/98,?000원/)).toBeInTheDocument();
  });

  it('주문 생성 시 선택한 장바구니 상품만 요청 body에 포함한다', async () => {
    const createOrderRequest = vi.fn();
    const order = createOrder({
      items: [
        {
          product: mockCartItems[1].product,
          quantity: mockCartItems[1].quantity,
        },
      ],
      amount: {
        orderAmount: 25000,
        shippingAmount: 3000,
        discountAmount: 0,
        totalAmount: 28000,
      },
    });

    localStorage.clear();
    localStorage.setItem(CART_SELECT_LOCAL_STORAGE_KEY, JSON.stringify({ '1': false, '2': true }));
    server.use(createOrderHandler(order, createOrderRequest), getOrderHandler(order));

    renderCartPage();

    await screen.findByText('상품이름A');

    fireEvent.click(screen.getByRole('button', { name: '주문 확인' }));

    expect(await screen.findByText(/1종류/)).toBeInTheDocument();
    expect(createOrderRequest).toHaveBeenCalledWith([{ productId: 'b', quantity: 1 }]);
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
