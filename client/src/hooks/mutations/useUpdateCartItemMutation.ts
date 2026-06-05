import type { APIResponse, CartItem } from '../../types';
import useMutation from '../useMutation';

interface UseUpdateCartItemMutationOption {
  cartItemId: CartItem['cartItemId'];
  onSuccess: () => void;
}

export default function useUpdateCartItemMutation({
  cartItemId,
  onSuccess,
}: UseUpdateCartItemMutationOption) {
  return useMutation<APIResponse<CartItem>>({
    url: `${import.meta.env.VITE_API_URL}/cart/${cartItemId}`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    onSuccess: (response) => {
      if (response?.status === 'success') {
        onSuccess();
      }
    },
    onError: () => {
      alert('장바구니 수량 변경에 실패했습니다.');
    },
  });
}
