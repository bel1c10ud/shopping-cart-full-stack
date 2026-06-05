import type { CartItem } from '../types';
import type { ChangeEvent } from 'react';
import { formatWon } from '../utils';
import Flex from './common/Flex';
import Typo from './common/Typo';
import Button from './common/Button';
import { css } from '@emotion/css';
import CheckBox from './common/CheckBox';
import List from './common/List';
import Image from './common/Image';
import useUpdateCartItemMutation from '../hooks/mutations/useUpdateCartItemMutation';
import useDeleteCartItemMutation from '../hooks/mutations/useDeleteCartItemMutation';

export default function CartItem(props: {
  data: CartItem;
  checked: boolean;
  onSelect: (value: boolean) => void;
  onUpdate: () => void;
  onDelete: () => void;
}) {
  const updateCartItemMutation = useUpdateCartItemMutation({
    cartItemId: props.data.cartItemId,
    onSuccess: props.onUpdate,
  });

  const deleteCartItemMutation = useDeleteCartItemMutation({
    cartItemId: props.data.cartItemId,
    onSuccess: props.onDelete,
  });

  const handleChangeChecked = (e: ChangeEvent<HTMLInputElement>) => props.onSelect(e.target.checked);

  return (
    <List.Item
      direction="column"
      gap={8}
      header={
        <Flex justifyContent="space-between">
          <CheckBox checked={props.checked} onChange={handleChangeChecked} />
          <Button size="s" onClick={() => deleteCartItemMutation.mutate()}>
            삭제
          </Button>
        </Flex>
      }
      py={16}
      content={
        <Flex alignItems="center" gap={24}>
          <Image className={imageStyle} src={props.data.product.image} alt={props.data.product.name} />
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
                onClick={() => updateCartItemMutation.mutate({ body: { quantity: props.data.quantity - 1 } })}
                disabled={updateCartItemMutation.status === 'loading' || props.data.quantity <= 1}
              >
                -
              </Button>
              <Typo as="span" size="s">
                {props.data.quantity}
              </Typo>
              <Button
                size="s"
                onClick={() => updateCartItemMutation.mutate({ body: { quantity: props.data.quantity + 1 } })}
                disabled={updateCartItemMutation.status === 'loading' || props.data.quantity >= 99}
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

const imageStyle = css`
  width: 112px;
  height: 112px;
  border-radius: var(--radius-l);
`;
