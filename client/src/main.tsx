import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router';
import CartPage from './pages/CartPage.tsx';
import './styles/index.css';
import OrderPage from './pages/OrderPage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path={'/'} element={<CartPage />} />
        <Route path={'/order/:orderId'} element={<OrderPage />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
);
