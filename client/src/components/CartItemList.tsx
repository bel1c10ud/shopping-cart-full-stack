import useCartItemSelection from '../hooks/useCartItemSelection';
import type { CartItem as TCartItem } from '../types';
import CartItem from './CartItem';
import CheckBox from './common/CheckBox';
import Flex from './common/Flex';
import List from './common/List';
import Typo from './common/Typo';

export default function CartItemList(props: { data: TCartItem[] }) {
  const { selectedById, setAllSelected } = useCartItemSelection(props.data);

  return (
    <List
      divider={{ header: true, item: true }}
      header={
        <Flex alignItems="center" gap={8} py={16}>
          <CheckBox
            id="check-all"
            checked={!Object.entries(selectedById).some((el) => !el[1])}
            onChange={setAllSelected}
          />
          <Typo as="label" size="s" htmlFor="check-all">
            전체선택
          </Typo>
        </Flex>
      }
    >
      {props.data.map((item) => (
        <CartItem key={item.cartItemId} data={item} />
      ))}
    </List>
  );
}
