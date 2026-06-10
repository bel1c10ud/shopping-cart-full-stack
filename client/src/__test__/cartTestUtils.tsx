import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import CartPage from '../pages/CartPage';
import OrderPage from '../pages/OrderPage';
import type { CartItem } from '../types';

export const createCartItems = (): CartItem[] => [
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

export const renderCartPage = () => {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<CartPage />} />
        <Route path="/order" element={<OrderPage />} />
      </Routes>
    </MemoryRouter>,
  );
};
