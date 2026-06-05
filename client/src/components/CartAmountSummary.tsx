import type { CartItem } from '../types';
import { formatWon } from '../utils';
import useCalculateCartAmount from '../hooks/useCalculateCartAmount';
import Flex from './common/Flex';
import Image from './common/Image';
import List from './common/List';
import Typo from './common/Typo';

export default function CartAmountSummary(props: { selectedCartItems: CartItem[] }) {
  const { orderAmount, shippingAmount, totalAmount } = useCalculateCartAmount(props.selectedCartItems);

  return (
    <List
      divider={{ header: true, footer: true }}
      header={
        <Flex gap={4} py={10}>
          <Image src={`${import.meta.env.BASE_URL}infomation.svg`} alt="infomation icon" />
          <Typo size="s">총 주문 금액이 {formatWon(100000)} 이상일 경우 무료 배송됩니다</Typo>
        </Flex>
      }
      footer={
        <Flex justifyContent="space-between" py={10}>
          <Typo weight="bold">총 결제 금액</Typo>
          <Typo weight="bold" size="l" aria-label="총 결제 금액" data-value={totalAmount}>
            {formatWon(totalAmount)}
          </Typo>
        </Flex>
      }
    >
      <List.Item
        left={<Typo weight="bold">주문 금액</Typo>}
        content={
          <Typo weight="bold" size="l" aria-label="주문 금액" data-value={orderAmount}>
            {formatWon(orderAmount)}
          </Typo>
        }
        py={10}
      />
      <List.Item
        left={<Typo weight="bold">배송비</Typo>}
        content={
          <Typo weight="bold" size="l" aria-label="배송비" data-value={shippingAmount}>
            {formatWon(shippingAmount)}
          </Typo>
        }
        py={10}
      />
    </List>
  );
}
