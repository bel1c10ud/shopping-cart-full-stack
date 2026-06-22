import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import type { CartItem } from '../types';
import {
  calculateCartAmount,
  getCartAmountHandler,
  getCartHandler,
  updateCartQuantityErrorHandler,
  updateCartQuantityHandler,
} from './cartHandlers';
import { createCartItems, renderCartPage } from './cartTestUtils';

const CART_API_URL = `${import.meta.env.VITE_API_URL}/cart`;

describe('CartPage 수량 변경', () => {
  let mockCartItems: CartItem[];

  beforeEach(() => {
    mockCartItems = createCartItems();
    server.use(
      getCartHandler(mockCartItems),
      updateCartQuantityHandler(
        mockCartItems,
        (cartItems) => {
          mockCartItems = cartItems;
          server.use(getCartHandler(mockCartItems), getCartAmountHandler(calculateCartAmount(mockCartItems)));
        },
      ),
      getCartAmountHandler(calculateCartAmount(mockCartItems)),
    );
  });

  it('장바구니 상품의 수량을 변경할 수 있다', async () => {
    renderCartPage();

    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const plusButton = within(itemA).getByRole('button', { name: '+' });

    fireEvent.click(plusButton);

    expect(await within(itemA).findByText('3')).toBeInTheDocument();
  });

  it('수량이 1개이면 감소 버튼을 비활성화한다', async () => {
    mockCartItems[0].quantity = 1;
    renderCartPage();

    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const minusButton = within(itemA).getByRole('button', { name: '-' });
    expect(minusButton).toBeDisabled();
  });

  it('수량이 99개이면 증가 버튼을 비활성화한다', async () => {
    mockCartItems[0].quantity = 99;
    renderCartPage();

    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const plusButton = within(itemA).getByRole('button', { name: '+' });
    expect(plusButton).toBeDisabled();
  });

  it('수량 변경 시 PATCH /cart/:cartItemId API를 호출한다', async () => {
    const patchSpy = vi.fn();
    server.use(
      http.patch(`${CART_API_URL}/:cartItemId`, ({ params }) => {
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

    renderCartPage();
    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const plusButton = within(itemA).getByRole('button', { name: '+' });

    fireEvent.click(plusButton);

    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalledWith('1');
    });
  });

  it('API 요청에 실패하면 사용자에게 에러 메시지를 표시한다', async () => {
    server.use(updateCartQuantityErrorHandler('1'));

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderCartPage();
    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const plusButton = within(itemA).getByRole('button', { name: '+' });

    fireEvent.click(plusButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalled();
    });

    alertMock.mockRestore();
  });
});
