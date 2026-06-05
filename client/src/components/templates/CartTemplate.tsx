import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import type { CartItem as TCartItem } from '../../types';
import useCartItemSelection from '../../hooks/useCartItemSelection';
import Typo from '../common/Typo';
import Flex from '../common/Flex';
import View from '../common/View';
import Button from '../common/Button';
import CartItemList from '../CartItemList';
import CartAmountSummary from '../CartAmountSummary';

export default function CartTemplate(props: { data: TCartItem[]; refetchData: () => void }) {
  const navigate = useNavigate();

  const { selectedById, setSelected, setAllSelected } = useCartItemSelection(props.data);

  const selectedCartItems = useMemo(() => {
    return props.data.filter((cartItem) => selectedById[cartItem.cartItemId]);
  }, [props.data, selectedById]);

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
        selectedById={selectedById}
        onSelect={setSelected}
        onSelectAll={setAllSelected}
        refetchData={props.refetchData}
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
          disabled={!Object.entries(selectedById).some((el) => el[1])}
        >
          주문 확인
        </Button>
      </View.CTA>
    </View>
  );
}
