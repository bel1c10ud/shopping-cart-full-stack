import type { APIResponse, CartItem } from '../types';
import useMutation from '../hooks/useMutation';
import type { ChangeEvent } from 'react';
import { formatWon } from '../utils';
import Flex from './common/Flex';
import Typo from './common/Typo';
import Button from './common/Button';
import { css } from '@emotion/css';
import CheckBox from './common/CheckBox';
import List from './common/List';
import Image from './common/Image';

export default function CartItem(props: {
  data: CartItem;
  checked: boolean;
  onSelect: (value: boolean) => void;
  onUpdate: () => void;
  onDelete: () => void;
}) {
  const updateMutation = useMutation<APIResponse<CartItem>>({
    url: `${import.meta.env.VITE_API_URL}/cart/${props.data.cartItemId}`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    onSuccess: (response) => {
      if (response && response.status === 'success') {
        props.onUpdate();
      }
    },
    onError: () => {
      alert('장바구니 수량 변경에 실패했습니다.');
    },
  });

  const deleteMutation = useMutation<APIResponse<CartItem>>({
    url: `${import.meta.env.VITE_API_URL}/cart/${props.data.cartItemId}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    onSuccess: (response) => {
      if (response && response.status === 'success') {
        props.onDelete();
      }
    },
    onError: () => {
      alert('장바구니 삭제에 실패했습니다.');
    },
  });

  const handleChangeChecked = (e: ChangeEvent<HTMLInputElement>) => props.onSelect(e.target.checked);

  return (
    <List.Item
      direction="column"
      gap={8}
      header={
        <Flex justifyContent="space-between">
          <CheckBox checked={props.checked} onChange={handleChangeChecked} />
          <Button size="s" onClick={() => deleteMutation.mutate()}>
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
                onClick={() =>
                  updateMutation.mutate({
                    body: { cartItemId: props.data.cartItemId, quantity: props.data.quantity - 1 },
                  })
                }
                disabled={updateMutation.status === 'loading' || props.data.quantity <= 1}
              >
                -
              </Button>
              <Typo as="span" size="s">
                {props.data.quantity}
              </Typo>
              <Button
                size="s"
                onClick={() =>
                  updateMutation.mutate({
                    body: { cartItemId: props.data.cartItemId, quantity: props.data.quantity + 1 },
                  })
                }
                disabled={updateMutation.status === 'loading' || props.data.quantity >= 99}
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
