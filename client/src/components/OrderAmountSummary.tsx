import { css } from '@emotion/css';
import type { AmountSummary } from '../types';
import { formatWon } from '../utils';
import Flex from './common/Flex';
import Image from './common/Image';
import Spinner from './common/Spinner';
import Typo from './common/Typo';

interface OrderAmountSummaryProps {
  amount: AmountSummary;
  isLoading: boolean;
}

export default function OrderAmountSummary({ amount, isLoading }: OrderAmountSummaryProps) {
  return (
    <Flex.Column>
      <Flex gap={4} py={10}>
        <Image src={`${import.meta.env.BASE_URL}infomation.svg`} alt="infomation icon" />
        <Typo size="s">총 주문 금액이 {formatWon(100000)} 이상일 경우 무료 배송됩니다</Typo>
      </Flex>
      <Flex.Column as="ul" className={amountSummaryListStyle}>
        <Flex as="li" alignItems="center" justifyContent="space-between" py={10}>
          <Typo size="m" weight="bold">
            주문 금액
          </Typo>
          <Typo size="xl" weight="bold">
            {isLoading ? <Spinner size="s" aria-label="주문 금액 갱신 중" /> : formatWon(amount.orderAmount)}
          </Typo>
        </Flex>
        <Flex as="li" alignItems="center" justifyContent="space-between" py={10}>
          <Typo size="m" weight="bold">
            쿠폰 할인 금액
          </Typo>
          <Typo size="xl" weight="bold">
            {isLoading ? <Spinner size="s" aria-label="쿠폰 할인 금액 갱신 중" /> : formatWon(amount.discountAmount)}
          </Typo>
        </Flex>
        <Flex as="li" alignItems="center" justifyContent="space-between" py={10}>
          <Typo size="m" weight="bold">
            배송비
          </Typo>
          <Typo size="xl" weight="bold">
            {isLoading ? <Spinner size="s" aria-label="배송비 갱신 중" /> : formatWon(amount.shippingAmount)}
          </Typo>
        </Flex>
      </Flex.Column>
      <Flex alignItems="center" justifyContent="space-between" py={10}>
        <Typo size="m" weight="bold">
          총 결제 금액
        </Typo>
        <Typo size="xl" weight="bold">
          {isLoading ? <Spinner size="s" aria-label="총 결제 금액 갱신 중" /> : formatWon(amount.totalAmount)}
        </Typo>
      </Flex>
    </Flex.Column>
  );
}

const amountSummaryListStyle = css`
  border-top: 1px solid var(--color-gray-200);
  border-bottom: 1px solid var(--color-gray-200);
`;
