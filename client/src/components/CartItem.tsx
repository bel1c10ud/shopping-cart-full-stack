import type { ChangeEventHandler } from 'react';
import type { APIResponse, CartItem } from '../types';
import useMutation from '../hooks/useMutation';

export default function CartItem(props: {
  data: CartItem;
  isChecked: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onUpdate: (updatedItem: CartItem) => void;
}) {
  const { status, mutate } = useMutation<APIResponse<CartItem>>({
    url: `${import.meta.env.VITE_API_URL}/cart/${props.data.cartItemId}`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    onSuccess: (response) => {
      if (response && response.status === 'success') {
        props.onUpdate(response.data);
      }
    },
    onError: () => {
      alert('장바구니 수량 변경에 실패했습니다.');
    },
  });

  return (
    <li>
      <div>
        <input type="checkbox" checked={props.isChecked} onChange={props.onChange} />
        <button>삭제</button>
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
