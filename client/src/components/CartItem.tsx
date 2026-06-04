import type { ChangeEventHandler } from 'react';
import type { APIResponse, CartItem } from '../types';
import useMutation from '../hooks/useMutation';

export default function CartItem(props: {
  data: CartItem;
  isChecked: boolean;
  storage: Record<string, boolean>;
  setStorage: (value: Record<string, boolean>) => void;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onUpdate: () => void;
  onDelete: () => void;
}) {
  const { status, mutate } = useMutation<APIResponse<CartItem>>({
    url: `${import.meta.env.VITE_API_URL}/cart/${props.data.cartItemId}`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    onSuccess: (response) => {
      if (response && response.status === 'success') {
        props.onUpdate();
      }
    },
    onError: () => {
      alert('장바구니 수량 변경에 실패했습니다.');
    },
  });

  const deleteMutation = useMutation<APIResponse<CartItem>>({
    url: `${import.meta.env.VITE_API_URL}/cart/${props.data.cartItemId}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    onSuccess: (response) => {
      if (response && response.status === 'success') {
        console.log(response);
        const newStorage = { ...props.storage };
        delete newStorage[response.data.cartItemId];
        props.setStorage(newStorage);
        props.onDelete();
      }
    },
    onError: () => {
      alert('장바구니 삭제에 실패했습니다.');
    },
  });

  return (
    <li>
      <div>
        <input type="checkbox" checked={props.isChecked} onChange={props.onChange} />
        <button onClick={() => deleteMutation.mutate()}>삭제</button>
      </div>
      <div>
        <img src={props.data.product.image} />
        <div>
          <div>{props.data.product.name}</div>
          <span>{props.data.product.price}</span>
          <div>
            <button
              onClick={() => mutate({ body: { cartItemId: props.data.cartItemId, quantity: props.data.quantity - 1 } })}
              disabled={status === 'loading' || props.data.quantity <= 1}
            >
              -
            </button>
            <span>{props.data.quantity}</span>
            <button
              onClick={() => mutate({ body: { cartItemId: props.data.cartItemId, quantity: props.data.quantity + 1 } })}
              disabled={status === 'loading' || props.data.quantity >= 99}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
