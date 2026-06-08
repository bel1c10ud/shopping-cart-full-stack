import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import type { CartItem as TCartItem } from '../../types';
import Typo from '../common/Typo';
import Flex from '../common/Flex';
import View from '../common/View';
import Button from '../common/Button';
import CartItemList from '../CartItemList';
import CartAmountSummary from '../CartAmountSummary';

export default function CartTemplate(props: {
  data: TCartItem[];
  selectedById: Record<string, boolean>;
  onSelect: (cartItemId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onUpdateCartItemQuantity: (cartItem: Pick<TCartItem, 'cartItemId' | 'quantity'>) => void;
  onDeleteCartItem: (cartItemId: TCartItem['cartItemId']) => void;
}) {
  const navigate = useNavigate();

  const selectedCartItems = useMemo(() => {
    return props.data.filter((cartItem) => props.selectedById[cartItem.cartItemId]);
  }, [props.data, props.selectedById]);

  return (
    <View gap={24}>
      <Flex direction="column">
        <Typo as="h1" size="xl" weight="bold">
          장바구니
        </Typo>
        <Typo as="h2" size="s">
          현재 {props.data.length}종류의 상품이 담겨있습니다.
        </Typo>
      </Flex>
      <CartItemList
        data={props.data}
        selectedById={props.selectedById}
        onSelect={props.onSelect}
        onSelectAll={props.onSelectAll}
        onUpdateCartItemQuantity={props.onUpdateCartItemQuantity}
        onDeleteCartItem={props.onDeleteCartItem}
      />
      <CartAmountSummary selectedCartItems={selectedCartItems} />
      <View.CTA>
        <Button
          variant="cta"
          onClick={() =>
            navigate('/order', {
              state: { products: selectedCartItems },
            })
          }
          disabled={!Object.entries(props.selectedById).some((el) => el[1])}
        >
          주문 확인
        </Button>
      </View.CTA>
    </View>
  );
}
