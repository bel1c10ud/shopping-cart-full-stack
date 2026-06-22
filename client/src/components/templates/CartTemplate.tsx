import { useNavigate } from 'react-router';
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

  const selectedCartItems = props.data.filter((cartItem) => cartItem.isSelected);

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
      <CartAmountSummary />
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
          disabled={selectedCartItems.length === 0}
        >
          주문 확인
        </Button>
      </View.CTA>
    </View>
  );
}
