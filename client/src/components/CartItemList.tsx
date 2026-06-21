import { css } from '@emotion/css';
import useCartItemSelection from '../hooks/useCartItemSelection';
import type { CartItem as TCartItem } from '../types';
import CartItem from './CartItem';
import CheckBox from './common/CheckBox';
import Flex from './common/Flex';
import Typo from './common/Typo';

export default function CartItemList(props: { data: TCartItem[] }) {
  const { selectedById, setAllSelected } = useCartItemSelection(props.data);

  return (
    <Flex direction="column">
      <Flex alignItems="center" gap={8} py={16} className={headerStyle}>
        <CheckBox
          id="check-all"
          checked={!Object.entries(selectedById).some((el) => !el[1])}
          onChange={setAllSelected}
        />
        <Typo as="label" size="s" htmlFor="check-all">
          전체선택
        </Typo>
      </Flex>
      <Flex as="ul" direction="column" className={listStyle}>
        {props.data.map((item) => (
          <CartItem key={item.cartItemId} data={item} />
        ))}
      </Flex>
    </Flex>
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
