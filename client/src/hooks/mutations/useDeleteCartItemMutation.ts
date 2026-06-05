import type { APIResponse, CartItem } from '../../types';
import useMutation from '../useMutation';

interface UseDeleteCartItemMutationOption {
  cartItemId: CartItem['cartItemId'];
  onSuccess: () => void;
}

export default function useDeleteCartItemMutation({
  cartItemId,
  onSuccess,
}: UseDeleteCartItemMutationOption) {
  return useMutation<APIResponse<CartItem>>({
    url: `${import.meta.env.VITE_API_URL}/cart/${cartItemId}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    onSuccess: (response) => {
      if (response?.status === 'success') {
        onSuccess();
      }
    },
    onError: () => {
      alert('장바구니 삭제에 실패했습니다.');
    },
  });
}
