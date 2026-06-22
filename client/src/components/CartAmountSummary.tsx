import { css } from '@emotion/css';
import type { CartItem } from '../types';
import { formatWon } from '../utils';
import useCalculateCartAmount from '../hooks/useCalculateCartAmount';
import Flex from './common/Flex';
import Image from './common/Image';
import Typo from './common/Typo';

export default function CartAmountSummary(props: { selectedCartItems: CartItem[] }) {
  const { orderAmount, shippingAmount, totalAmount } = useCalculateCartAmount(props.selectedCartItems);

  return (
    <Flex.Column>
      <Flex gap={4} py={10} className={headerStyle}>
        <Image src={`${import.meta.env.BASE_URL}infomation.svg`} alt="infomation icon" />
        <Typo size="s">총 주문 금액이 {formatWon(100000)} 이상일 경우 무료 배송됩니다</Typo>
      </Flex>
      <Flex.Column as="ul" className={listStyle}>
        <Flex as="li" justifyContent="space-between" alignItems="center" py={10}>
          <Typo weight="bold">주문 금액</Typo>
          <Typo weight="bold" size="l" aria-label="주문 금액" data-value={orderAmount}>
            {formatWon(orderAmount)}
          </Typo>
        </Flex>
        <Flex as="li" justifyContent="space-between" alignItems="center" py={10}>
          <Typo weight="bold">배송비</Typo>
          <Typo weight="bold" size="l" aria-label="배송비" data-value={shippingAmount}>
            {formatWon(shippingAmount)}
          </Typo>
        </Flex>
      </Flex.Column>
      <Flex justifyContent="space-between" py={10} className={footerStyle}>
        <Typo weight="bold">총 결제 금액</Typo>
        <Typo weight="bold" size="l" aria-label="총 결제 금액" data-value={totalAmount}>
          {formatWon(totalAmount)}
        </Typo>
      </Flex>
    </Flex.Column>
  );
}

const headerStyle = css`
  border-bottom: 1px solid var(--color-gray-200);
`;

const footerStyle = css`
  border-top: 1px solid var(--color-gray-200);
`;

const listStyle = css`
  margin: 0;
  padding: 0;
  list-style: none;

  > li {
    list-style: none;
  }
`;
