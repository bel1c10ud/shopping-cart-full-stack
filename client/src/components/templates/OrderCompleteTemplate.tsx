import { useNavigate } from 'react-router';
import { css } from '@emotion/css';
import type { OrderWithProduct } from '../../types';
import { formatWon } from '../../utils';
import Button from '../common/Button';
import Flex from '../common/Flex';
import Typo from '../common/Typo';
import View from '../common/View';

export default function OrderCompleteTemplate(props: { data: OrderWithProduct }) {
  const navigate = useNavigate();
  const itemCount = props.data.items.reduce((prev, cur) => prev + cur.quantity, 0);

  return (
    <View>
      <Flex direction="column" alignItems="center" justifyContent="center" flexGrow={1} gap={12}>
        <Typo as="h2" size="l" weight="bold">
          결제 확인
        </Typo>
        <Typo size="s" align="center" className={descriptionStyle}>
          총 {props.data.items.length}종류의 상품 {itemCount}개를 주문했습니다.
          <br />
          최종 결제 금액을 확인해 주세요.
        </Typo>
        <Flex direction="column" alignItems="center" gap={4}>
          <Typo size="m" weight="bold">
            총 결제 금액
          </Typo>
          <Typo size="xl" weight="bold">
            {formatWon(props.data.amount.totalAmount)}
          </Typo>
        </Flex>
      </Flex>

      <View.CTA>
        <Button variant="cta" onClick={() => navigate('/')}>
          장바구니로 돌아가기
        </Button>
      </View.CTA>
    </View>
  );
}

const descriptionStyle = css`
  line-height: 1.5;
`;
