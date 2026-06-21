import { css } from '@emotion/css';
import type { ReactNode } from 'react';

interface ModalLayoutProps {
  children: ReactNode;
  onClose?: () => void;
}

export default function ModalLayout({ children, onClose }: ModalLayoutProps) {
  return (
    <div className={overlayStyle} onClick={onClose}>
      <section className={modalStyle} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        {children}
      </section>
    </div>
  );
}

const overlayStyle = css`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgb(0 0 0 / 35%);
`;

const modalStyle = css`
  width: 100%;
  max-width: 360px;
  max-height: calc(100dvh - 48px);
  overflow-y: auto;
  border-radius: var(--radius-l);
  background-color: var(--color-white);
  padding: 24px;
`;
