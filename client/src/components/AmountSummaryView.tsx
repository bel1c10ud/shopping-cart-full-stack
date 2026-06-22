import { css } from '@emotion/css';
import type { AmountSummary } from '../types';
import { formatWon } from '../utils';
import Flex from './common/Flex';
import Image from './common/Image';
import Spinner from './common/Spinner';
import Typo from './common/Typo';

interface AmountSummaryViewProps {
  amount: AmountSummary;
  isLoading?: boolean;
  showDiscount?: boolean;
  valueSize?: 'l' | 'xl';
}

export default function AmountSummaryView({
  amount,
  isLoading = false,
  showDiscount = false,
  valueSize = 'xl',
}: AmountSummaryViewProps) {
  return (
    <Flex.Column>
      <Flex gap={4} py={10}>
        <Image src={`${import.meta.env.BASE_URL}infomation.svg`} alt="infomation icon" />
        <Typo size="s">총 주문 금액이 {formatWon(100000)} 이상일 경우 무료 배송됩니다</Typo>
      </Flex>
      <Flex.Column as="ul" className={amountSummaryListStyle}>
        <AmountSummaryRow label="주문 금액" value={amount.orderAmount} isLoading={isLoading} valueSize={valueSize} />
        {showDiscount && amount.discountAmount > 0 && (
          <AmountSummaryRow
            label="쿠폰 할인 금액"
            value={amount.discountAmount}
            isDiscount
            isLoading={isLoading}
            valueSize={valueSize}
          />
        )}
        <AmountSummaryRow label="배송비" value={amount.shippingAmount} isLoading={isLoading} valueSize={valueSize} />
      </Flex.Column>
      <AmountSummaryRow label="총 결제 금액" value={amount.totalAmount} isLoading={isLoading} valueSize={valueSize} />
    </Flex.Column>
  );
}

function AmountSummaryRow(props: {
  label: string;
  value: number;
  isDiscount?: boolean;
  isLoading: boolean;
  valueSize: 'l' | 'xl';
}) {
  const valueText = `${props.isDiscount ? '-' : ''}${formatWon(props.value)}`;

  return (
    <Flex as="li" alignItems="center" justifyContent="space-between" py={10}>
      <Typo size="m" weight="bold">
        {props.label}
      </Typo>
      <Typo size={props.valueSize} weight="bold" aria-label={props.label} data-value={props.value}>
        {props.isLoading ? <Spinner size="s" aria-label={`${props.label} 갱신 중`} /> : valueText}
      </Typo>
    </Flex>
  );
}

const amountSummaryListStyle = css`
  border-top: 1px solid var(--color-gray-200);
  border-bottom: 1px solid var(--color-gray-200);
`;
