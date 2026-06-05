import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { server } from '../mocks/server';
import { CART_SELECT_LOCAL_STORAGE_KEY } from '../hooks/useCartItemSelection';
import type { CartItem } from '../types';
import { deleteCartItemErrorHandler, deleteCartItemHandler, getCartHandler } from './cartHandlers';
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
        },
      ),
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

  it('제거된 상품을 화면과 선택 상태에서 제거하고 선택 정보도 함께 제거한다', async () => {
    localStorage.clear();
    localStorage.setItem(CART_SELECT_LOCAL_STORAGE_KEY, JSON.stringify({ '1': true, '2': true }));

    renderCartPage();
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
});
