import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { server } from '../mocks/server';
import type { CartItem } from '../types';
import { calculateCartAmount, deleteCartItemErrorHandler, deleteCartItemHandler, getCartAmountHandler, getCartHandler } from './cartHandlers';
import { createCartItems, renderCartPage } from './cartTestUtils';

describe('CartPage 삭제', () => {
  let mockCartItems: CartItem[];

  beforeEach(() => {
    mockCartItems = createCartItems();
    server.use(
      getCartHandler(mockCartItems),
      deleteCartItemHandler(
        mockCartItems,
        (cartItems) => {
          mockCartItems = cartItems;
          server.use(getCartHandler(mockCartItems), getCartAmountHandler(calculateCartAmount(mockCartItems)));
        },
      ),
      getCartAmountHandler(calculateCartAmount(mockCartItems)),
    );
  });

  it('장바구니 상품을 제거할 수 있다', async () => {
    renderCartPage();
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
      deleteCartItemHandler(
        mockCartItems,
        (cartItems) => {
          mockCartItems = cartItems;
        },
        deleteSpy,
      ),
    );

    renderCartPage();
    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const deleteButton = within(itemA).getByRole('button', { name: '삭제' });

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith('1');
    });
  });

  it('제거된 상품을 화면에서 제거하고 서버 금액을 다시 조회한다', async () => {
    const requestCartAmount = vi.fn();
    server.use(
      deleteCartItemHandler(mockCartItems, (cartItems) => {
        mockCartItems = cartItems;
        server.use(getCartHandler(mockCartItems), getCartAmountHandler(calculateCartAmount(mockCartItems), requestCartAmount));
      }),
      getCartAmountHandler(calculateCartAmount(mockCartItems), requestCartAmount),
    );
    renderCartPage();
    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const deleteButton = within(itemA).getByRole('button', { name: '삭제' });

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('상품이름A')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(requestCartAmount).toHaveBeenCalledTimes(2);
    });
  });

  it('제거 API 요청에 실패하면 사용자에게 에러 메시지를 표시한다', async () => {
    server.use(deleteCartItemErrorHandler());

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderCartPage();
    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const deleteButton = within(itemA).getByRole('button', { name: '삭제' });

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalled();
    });

    alertMock.mockRestore();
  });

  it('제거 API 요청에 실패하면 장바구니 목록을 다시 조회한다', async () => {
    const getCartSpy = vi.fn();
    server.use(getCartHandler(mockCartItems, getCartSpy), deleteCartItemErrorHandler());

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderCartPage();
    await screen.findByText('상품이름A');

    const itemA = screen.getByText('상품이름A').closest('li')!;
    const deleteButton = within(itemA).getByRole('button', { name: '삭제' });

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(getCartSpy).toHaveBeenCalledTimes(2);
    });

    alertMock.mockRestore();
  });
});
