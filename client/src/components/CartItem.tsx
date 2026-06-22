import type { CartItem as TCartItem } from '../types';
import { formatWon } from '../utils';
import useCartItemSelection from '../hooks/useCartItemSelection';
import useDeleteCartItemMutation from '../hooks/mutations/useDeleteCartItemMutation';
import useUpdateCartItemMutation from '../hooks/mutations/useUpdateCartItemMutation';
import Flex from './common/Flex';
import Typo from './common/Typo';
import Button from './common/Button';
import CheckBox from './common/CheckBox';
import Image from './common/Image';

export default function CartItem(props: { data: TCartItem }) {
  const cartItem = props.data;

  const { selectedById, setSelected } = useCartItemSelection();

  const updateCartItemQuantityMutation = useUpdateCartItemMutation({
    onFail: () => alert('장바구니 수량 변경에 실패했어요'),
    onError: () => alert('장바구니 수량 변경에 실패했어요'),
  });

  const deleteCartItemMutation = useDeleteCartItemMutation({
    onFail: () => alert('장바구니 삭제에 실패했어요'),
    onError: () => alert('장바구니 삭제에 실패했어요'),
  });

  return (
    <Flex.Column as="li" gap={8} py={16}>
      <Flex justifyContent="space-between">
        <CheckBox
          checked={selectedById[cartItem.cartItemId] ?? true}
          onChange={(checked) => setSelected(cartItem.cartItemId, checked)}
        />
        <Button size="s" onClick={() => deleteCartItemMutation.mutate(cartItem.cartItemId)}>
          삭제
        </Button>
      </Flex>

      <Flex justifyContent="space-between" alignItems="center">
        <Flex alignItems="center" gap={24}>
          <Image width={112} height={112} radius="l" src={cartItem.product.image} alt={cartItem.product.name} />
          <Flex.Column gap={8}>
            <Flex.Column>
              <Typo size="s">{cartItem.product.name}</Typo>
              <Typo size="xl" weight="bold">
                {formatWon(cartItem.product.price)}
              </Typo>
            </Flex.Column>
            <Flex alignItems="center" gap={8}>
              <Button
                size="s"
                onClick={() =>
                  updateCartItemQuantityMutation.mutate({
                    cartItemId: cartItem.cartItemId,
                    quantity: cartItem.quantity - 1,
                  })
                }
                disabled={cartItem.quantity <= 1}
              >
                -
              </Button>
              <Typo as="span" size="s">
                {cartItem.quantity}
              </Typo>
              <Button
                size="s"
                onClick={() =>
                  updateCartItemQuantityMutation.mutate({
                    cartItemId: cartItem.cartItemId,
                    quantity: cartItem.quantity + 1,
                  })
                }
                disabled={cartItem.quantity >= 99}
              >
                +
              </Button>
            </Flex>
          </Flex.Column>
        </Flex>
      </Flex>
    </Flex.Column>
  );
}
