import type { APIResponse, CartItem } from '../types';
import useMutation from '../hooks/useMutation';
import type { ChangeEvent } from 'react';
import { formatWon } from '../utils';

export default function CartItem(props: {
  data: CartItem;
  checked: boolean;
  onChangeChecked: (value: boolean) => void;
  onUpdate: () => void;
  onDelete: () => void;
}) {
  const updateMutation = useMutation<APIResponse<CartItem>>({
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
        props.onDelete();
      }
    },
    onError: () => {
      alert('장바구니 삭제에 실패했습니다.');
    },
  });

  const handleChangeChecked = (e: ChangeEvent<HTMLInputElement>) => props.onChangeChecked(e.target.checked);

  return (
    <li>
      <div>
        <input type="checkbox" checked={props.checked} onChange={handleChangeChecked} />
        <button onClick={() => deleteMutation.mutate()}>삭제</button>
      </div>
      <div>
        <img src={props.data.product.image} />
        <div>
          <div>{props.data.product.name}</div>
          <span>{formatWon(props.data.product.price)}</span>
          <div>
            <button
              onClick={() =>
                updateMutation.mutate({
                  body: { cartItemId: props.data.cartItemId, quantity: props.data.quantity - 1 },
                })
              }
              disabled={updateMutation.status === 'loading' || props.data.quantity <= 1}
            >
              -
            </button>
            <span>{props.data.quantity}</span>
            <button
              onClick={() =>
                updateMutation.mutate({
                  body: { cartItemId: props.data.cartItemId, quantity: props.data.quantity + 1 },
                })
              }
              disabled={updateMutation.status === 'loading' || props.data.quantity >= 99}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
