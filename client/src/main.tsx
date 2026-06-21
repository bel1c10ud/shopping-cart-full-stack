import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router';
import CartPage from './pages/CartPage.tsx';
import './styles/index.css';
import OrderPage from './pages/OrderPage.tsx';
import { ModalProvider } from './hooks/useModal.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ModalProvider>
      <HashRouter>
        <Routes>
          <Route path={'/'} element={<CartPage />} />
          <Route path={'/order/:orderId'} element={<OrderPage />} />
        </Routes>
      </HashRouter>
    </ModalProvider>
  </StrictMode>,
);
