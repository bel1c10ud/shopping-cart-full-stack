import { css } from '@emotion/css';
import useCartAmountQuery from '../hooks/queries/useCartAmountQuery';
import { formatWon } from '../utils';
import Flex from './common/Flex';
import Image from './common/Image';
import Spinner from './common/Spinner';
import Typo from './common/Typo';

const emptyAmount = {
  orderAmount: 0,
  shippingAmount: 0,
  discountAmount: 0,
  totalAmount: 0,
};

export default function CartAmountSummary() {
  const cartAmountQuery = useCartAmountQuery();
  const amount = cartAmountQuery.data ?? emptyAmount;

  return (
    <Flex.Column>
      <Flex gap={4} py={10} className={headerStyle}>
        <Image src={`${import.meta.env.BASE_URL}infomation.svg`} alt="infomation icon" />
        <Typo size="s">총 주문 금액이 {formatWon(100000)} 이상일 경우 무료 배송됩니다</Typo>
      </Flex>
      <Flex.Column as="ul" className={listStyle}>
        <Flex as="li" justifyContent="space-between" alignItems="center" py={10}>
          <Typo weight="bold">주문 금액</Typo>
          <Typo weight="bold" size="l" aria-label="주문 금액" data-value={amount.orderAmount}>
            {cartAmountQuery.isFetching ? (
              <Spinner size="s" aria-label="주문 금액 갱신 중" />
            ) : (
              formatWon(amount.orderAmount)
            )}
          </Typo>
        </Flex>
        <Flex as="li" justifyContent="space-between" alignItems="center" py={10}>
          <Typo weight="bold">배송비</Typo>
          <Typo weight="bold" size="l" aria-label="배송비" data-value={amount.shippingAmount}>
            {cartAmountQuery.isFetching ? <Spinner size="s" aria-label="배송비 갱신 중" /> : formatWon(amount.shippingAmount)}
          </Typo>
        </Flex>
      </Flex.Column>
      <Flex justifyContent="space-between" py={10} className={footerStyle}>
        <Typo weight="bold">총 결제 금액</Typo>
        <Typo weight="bold" size="l" aria-label="총 결제 금액" data-value={amount.totalAmount}>
          {cartAmountQuery.isFetching ? (
            <Spinner size="s" aria-label="총 결제 금액 갱신 중" />
          ) : (
            formatWon(amount.totalAmount)
          )}
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
