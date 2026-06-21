import type { OrderWithProduct } from './../../types';
import View from '../common/View';
import Flex from '../common/Flex';
import Typo from '../common/Typo';
import Button from '../common/Button';
import Image from '../common/Image';
import { formatWon } from '../../utils';
import CheckBox from '../common/CheckBox';
import { useId } from 'react';
import { css } from '@emotion/css';
import useUpdateOrderMutation from '../../hooks/mutations/useUpdateOrderMutation';
import { useModal } from '../../hooks/useModal';
import CouponApplyModal from '../CouponApplyModal';

export default function OrderTemplate(props: { data: OrderWithProduct }) {
  const { openModalAsync } = useModal();

  const remoteAreaInputId = useId();

  const updateMutation = useUpdateOrderMutation(props.data.orderId);

  const itemTypeCount = props.data.items.length;
  const itemCount = props.data.items.reduce((prev, cur) => prev + cur.quantity, 0);

  const handleClickOpenModal = async () => {
    await openModalAsync<string[]>(({ close, exit }) => (
      <CouponApplyModal order={props.data} onConfirm={close} onCancel={exit} />
    ));
  };

  return (
    <View gap={24}>
      <Flex direction="column">
        <Typo as="h1" size="xl" weight="bold">
          주문 확인
        </Typo>
        <Typo as="h2" size="s">
          총 {itemTypeCount}종류의 상품 {itemCount}개를 주문합니다.
          <br />
          최종 결제 금액을 확인해 주세요.
        </Typo>
      </Flex>
      <Flex as="ul" direction="column" className={itemsListStyle}>
        {props.data.items.map((item) => (
          <Flex as="li" key={item.product.productId} alignItems="center" gap={24} py={8}>
            <Image width={112} height={112} radius="l" src={item.product.image} alt={item.product.name} />
            <Flex direction="column" gap={8}>
              <Flex direction="column">
                <Typo size="s">{item.product.name}</Typo>
                <Typo size="xl" weight="bold">
                  {formatWon(item.product.price)}
                </Typo>
              </Flex>
              <Typo as="span" size="s">
                {item.quantity}개
              </Typo>
            </Flex>
          </Flex>
        ))}
      </Flex>

      <Button onClick={handleClickOpenModal}>쿠폰 적용</Button>

      <Flex direction="column" gap={10}>
        <Typo size="m" weight="bold">
          배송 정보
        </Typo>
        <Flex alignItems="center" gap={8}>
          <CheckBox
            id={remoteAreaInputId}
            checked={props.data.isRemoteArea}
            onChange={(checked) => updateMutation.mutate({ isRemoteArea: checked })}
          />
          <Typo as="label" size="s" htmlFor={remoteAreaInputId}>
            제주도 및 도서 산간 지역
          </Typo>
        </Flex>
      </Flex>
      <Flex direction="column">
        <Flex gap={4} py={10}>
          <Image src={`${import.meta.env.BASE_URL}infomation.svg`} alt="infomation icon" />
          <Typo size="s">총 주문 금액이 {formatWon(100000)} 이상일 경우 무료 배송됩니다</Typo>
        </Flex>
        <Flex direction="column" as="ul" className={amountSummaryListStyle}>
          <Flex as="li" alignItems="center" justifyContent="space-between" py={10}>
            <Typo size="m" weight="bold">
              주문 금액
            </Typo>
            <Typo size="xl" weight="bold">
              {formatWon(props.data.amount.orderAmount)}
            </Typo>
          </Flex>
          <Flex as="li" alignItems="center" justifyContent="space-between" py={10}>
            <Typo size="m" weight="bold">
              쿠폰 할인 금액
            </Typo>
            <Typo size="xl" weight="bold">
              {formatWon(props.data.amount.discountAmount)}
            </Typo>
          </Flex>
          <Flex as="li" alignItems="center" justifyContent="space-between" py={10}>
            <Typo size="m" weight="bold">
              배송비
            </Typo>
            <Typo size="xl" weight="bold">
              {formatWon(props.data.amount.shippingAmount)}
            </Typo>
          </Flex>
        </Flex>
        <Flex as="li" alignItems="center" justifyContent="space-between" py={10}>
          <Typo size="m" weight="bold">
            총 결제 금액
          </Typo>
          <Typo size="xl" weight="bold">
            {formatWon(props.data.amount.totalAmount)}
          </Typo>
        </Flex>
      </Flex>
      <View.CTA>
        <Button variant="cta" disabled={updateMutation.status === 'loading'}>
          결제하기
        </Button>
      </View.CTA>
    </View>
  );
}

const itemsListStyle = css`
  & > li {
    border-top: 1px solid var(--color-gray-200);
  }
`;

const amountSummaryListStyle = css`
  border-top: 1px solid var(--color-gray-200);
  border-bottom: 1px solid var(--color-gray-200);
`;
