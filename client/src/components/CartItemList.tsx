import type { CartItem as TCartItem } from './../types';
import CartItem from './CartItem';
import CheckBox from './common/CheckBox';
import Flex from './common/Flex';
import List from './common/List';
import Typo from './common/Typo';

export default function CartItemList(props: {
  data: TCartItem[];
  selectedById: Record<string, boolean>;
  onSelect: (cartItemId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onUpdateCartItemQuantity: (cartItem: Pick<TCartItem, 'cartItemId' | 'quantity'>) => void;
  onDeleteCartItem: (cartItemId: TCartItem['cartItemId']) => void;
}) {
  return (
    <List
      divider={{ header: true, item: true }}
      header={
        <Flex alignItems="center" gap={8} py={16}>
          <CheckBox
            id="check-all"
            checked={!Object.entries(props.selectedById).some((el) => !el[1])}
            onChange={props.onSelectAll}
          />
          <Typo as="label" size="s" htmlFor="check-all">
            전체선택
          </Typo>
        </Flex>
      }
    >
      {props.data.map((item) => (
        <CartItem
          key={item.cartItemId}
          data={item}
          checked={props.selectedById[item.cartItemId]}
          onSelect={(checked) => props.onSelect(item.cartItemId, checked)}
          onUpdateCartItemQuantity={props.onUpdateCartItemQuantity}
          onDeleteCartItem={props.onDeleteCartItem}
        />
      ))}
    </List>
  );
}
