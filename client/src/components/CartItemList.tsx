import { css } from '@emotion/css';
import type { CartItem as TCartItem } from '../types';
import useUpdateCartItemMutation from '../hooks/mutations/useUpdateCartItemMutation';
import CartItem from './CartItem';
import CheckBox from './common/CheckBox';
import Flex from './common/Flex';
import Typo from './common/Typo';

export default function CartItemList(props: { data: TCartItem[] }) {
  const updateCartItemMutation = useUpdateCartItemMutation({
    onFail: () => alert('장바구니 선택 변경에 실패했어요'),
    onError: () => alert('장바구니 선택 변경에 실패했어요'),
  });
  const isAllSelected = props.data.every((item) => item.isSelected);
  const handleChangeAllSelected = (checked: boolean) => {
    props.data
      .filter((item) => item.isSelected !== checked)
      .forEach((item) => {
        updateCartItemMutation.mutate({
          cartItemId: item.cartItemId,
          isSelected: checked,
        });
      });
  };

  return (
    <Flex.Column>
      <Flex alignItems="center" gap={8} py={16} className={headerStyle}>
        <CheckBox
          id="check-all"
          checked={isAllSelected}
          onChange={handleChangeAllSelected}
        />
        <Typo as="label" size="s" htmlFor="check-all">
          전체선택
        </Typo>
      </Flex>
      <Flex.Column as="ul" className={listStyle}>
        {props.data.map((item) => (
          <CartItem key={item.cartItemId} data={item} />
        ))}
      </Flex.Column>
    </Flex.Column>
  );
}

const headerStyle = css`
  border-bottom: 1px solid var(--color-gray-200);
`;

const listStyle = css`
  margin: 0;
  padding: 0;
  list-style: none;

  > li {
    list-style: none;
  }

  > li + li {
    border-top: 1px solid var(--color-gray-200);
  }
`;
