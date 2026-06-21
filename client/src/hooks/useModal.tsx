import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

export type ModalResult<T> = { type: 'close'; value: T } | { type: 'exit' };

interface ModalControls<T> {
  close: (value: T) => void;
  exit: () => void;
}

interface ModalContextValue {
  openModalAsync: <T>(render: (controls: ModalControls<T>) => ReactNode) => Promise<ModalResult<T>>;
}

interface ModalItem {
  id: number;
  node: ReactNode;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const nextId = useRef(0);
  const [modals, setModals] = useState<ModalItem[]>([]);

  const openModalAsync = useCallback(<T,>(render: (controls: ModalControls<T>) => ReactNode) => {
    const id = nextId.current;
    nextId.current += 1;

    return new Promise<ModalResult<T>>((resolve) => {
      const unmount = () => {
        setModals((prev) => prev.filter((modal) => modal.id !== id));
      };

      const close = (value: T) => {
        unmount();
        resolve({ type: 'close', value });
      };

      const exit = () => {
        unmount();
        resolve({ type: 'exit' });
      };

      setModals((prev) => [...prev, { id, node: render({ close, exit }) }]);
    });
  }, []);

  return (
    <ModalContext value={{ openModalAsync }}>
      {children}
      {modals.map((modal) => (
        <div key={modal.id}>{modal.node}</div>
      ))}
    </ModalContext>
  );
}

export function useModal() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error('useModal은 ModalProvider 안에서 사용해야 합니다.');
  }

  return context;
}
