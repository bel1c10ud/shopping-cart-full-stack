import type { CartItem as TCartItem } from '../types';
import { formatWon } from '../utils';
import Flex from './common/Flex';
import Typo from './common/Typo';
import Button from './common/Button';
import CheckBox from './common/CheckBox';
import List from './common/List';
import Image from './common/Image';

export default function CartItem(props: {
  data: TCartItem;
  checked: boolean;
  onSelect: (value: boolean) => void;
  onUpdateCartItemQuantity: (cartItem: Pick<TCartItem, 'cartItemId' | 'quantity'>) => void;
  onDeleteCartItem: (cartItemId: TCartItem['cartItemId']) => void;
}) {
  return (
    <List.Item
      direction="column"
      gap={8}
      header={
        <Flex justifyContent="space-between">
          <CheckBox checked={props.checked} onChange={props.onSelect} />
          <Button size="s" onClick={() => props.onDeleteCartItem(props.data.cartItemId)}>
            삭제
          </Button>
        </Flex>
      }
      py={16}
      content={
        <Flex alignItems="center" gap={24}>
          <Image width={112} height={112} radius="l" src={props.data.product.image} alt={props.data.product.name} />
          <Flex direction="column" gap={8}>
            <Flex direction="column">
              <Typo size="s">{props.data.product.name}</Typo>
              <Typo size="xl" weight="bold">
                {formatWon(props.data.product.price)}
              </Typo>
            </Flex>
            <Flex alignItems="center" gap={8}>
              <Button
                size="s"
                onClick={() =>
                  props.onUpdateCartItemQuantity({
                    cartItemId: props.data.cartItemId,
                    quantity: props.data.quantity - 1,
                  })
                }
                disabled={props.data.quantity <= 1}
              >
                -
              </Button>
              <Typo as="span" size="s">
                {props.data.quantity}
              </Typo>
              <Button
                size="s"
                onClick={() =>
                  props.onUpdateCartItemQuantity({
                    cartItemId: props.data.cartItemId,
                    quantity: props.data.quantity + 1,
                  })
                }
                disabled={props.data.quantity >= 99}
              >
                +
              </Button>
            </Flex>
          </Flex>
        </Flex>
      }
    />
  );
}
