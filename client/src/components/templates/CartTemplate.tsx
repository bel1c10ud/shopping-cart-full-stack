import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import useCartItemSelection from '../../hooks/useCartItemSelection';
import type { CartItem as TCartItem } from '../../types';
import Typo from '../common/Typo';
import Flex from '../common/Flex';
import View from '../common/View';
import Button from '../common/Button';
import CartItemList from '../CartItemList';
import CartAmountSummary from '../CartAmountSummary';
import useCreateOrderMutation from '../../hooks/mutations/useCreateOrderMutation';

export default function CartTemplate(props: { data: TCartItem[] }) {
  const navigate = useNavigate();

  const createOrder = useCreateOrderMutation({
    onSuccess: (order) => {
      navigate(`/order/${order.orderId}`);
    },
  });

  const { selectedById } = useCartItemSelection(props.data);

  const selectedCartItems = useMemo(() => {
    return props.data.filter((cartItem) => selectedById[cartItem.cartItemId]);
  }, [props.data, selectedById]);

  return (
    <View gap={24}>
      <Flex.Column>
        <Typo as="h1" size="xl" weight="bold">
          장바구니
        </Typo>
        <Typo as="h2" size="s">
          현재 {props.data.length}종류의 상품이 담겨있습니다.
        </Typo>
      </Flex.Column>
      <CartItemList data={props.data} />
      <CartAmountSummary selectedCartItems={selectedCartItems} />
      <View.CTA>
        <Button
          variant="cta"
          onClick={() => {
            createOrder.mutate(
              selectedCartItems.map((item) => ({
                productId: item.product.productId,
                quantity: item.quantity,
              })),
            );
          }}
          disabled={!Object.entries(selectedById).some((el) => el[1])}
        >
          주문 확인
        </Button>
      </View.CTA>
    </View>
  );
}
