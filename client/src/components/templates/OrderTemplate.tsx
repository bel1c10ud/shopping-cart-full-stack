import type { CartItem } from './../../types';
import useCalculateCartAmount from './../../hooks/useCalculateCartAmount';
import { formatWon } from './../../utils';
import View from '../common/View';
import Flex from '../common/Flex';
import Typo from '../common/Typo';
import Button from '../common/Button';

export default function OrderTemplate(props: { data: CartItem[] }) {
  const { totalAmount } = useCalculateCartAmount(props.data);

  return (
    <View justifyContent="center" alignItems="center">
      <Flex direction="column" alignItems="center" gap={16}>
        <Typo as="h1" size="l" weight="bold">
          주문확인
        </Typo>
        <Typo size="s">
          총 {props.data.length}종류의 상품 {props.data.reduce((prev, cur) => prev + cur.quantity, 0)}개를 주문합니다.
          <br />
          최종 결제 금액을 확인해 주세요.
        </Typo>
        <Flex direction="column" alignItems="center">
          <Typo as="h2" size="m" weight="bold">
            총 결제 금액
          </Typo>
          <Typo as="h1" size="l" weight="bold">
            {formatWon(totalAmount)}
          </Typo>
        </Flex>
      </Flex>
      <Button disabled>결제하기</Button>
    </View>
  );
}
