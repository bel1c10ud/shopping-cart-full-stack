import type { OrderWithProduct } from './../../types';
import View from '../common/View';
import Flex from '../common/Flex';
import Typo from '../common/Typo';
import Button from '../common/Button';
import Image from '../common/Image';
import { formatWon } from '../../utils';
import CheckBox from '../common/CheckBox';
import { useId, useState } from 'react';
import { css } from '@emotion/css';
import useUpdateOrderMutation from '../../hooks/mutations/useUpdateOrderMutation';
import { useModal } from '../../hooks/useModal';
import CouponApplyModal from '../CouponApplyModal';
import { useNavigate } from 'react-router';
import useOrderQuery from '../../hooks/queries/useOrderQuery';
import OrderAmountSummary from '../OrderAmountSummary';

export default function OrderTemplate(props: { data: OrderWithProduct }) {
  const navigate = useNavigate();
  const { openModalAsync } = useModal();

  const remoteAreaInputId = useId();
  const [errorMessage, setErrorMessage] = useState('');

  const orderQuery = useOrderQuery(props.data.orderId);

  const updateMutation = useUpdateOrderMutation(props.data.orderId);

  const itemTypeCount = props.data.items.length;
  const itemCount = props.data.items.reduce((prev, cur) => prev + cur.quantity, 0);

  const handleClickOpenModal = async () => {
    if (updateMutation.status === 'loading' || orderQuery.isFetching) return;

    await openModalAsync<string[]>(({ close, exit }) => (
      <CouponApplyModal order={props.data} onConfirm={close} onCancel={exit} />
    ));
  };

  const handleClickPayment = async () => {
    if (updateMutation.status === 'loading' || orderQuery.isFetching) return;

    setErrorMessage('');

    try {
      const response = await orderQuery.refetchAsync();

      if (response.status !== 'success') {
        setErrorMessage('최신 주문 정보를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.');
        return;
      }

      navigate(`/order/${props.data.orderId}/complete`);
    } catch {
      setErrorMessage('최신 주문 정보를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  return (
    <View gap={24}>
      <Flex.Column>
        <Typo as="h1" size="xl" weight="bold">
          주문 확인
        </Typo>
        <Typo as="h2" size="s">
          총 {itemTypeCount}종류의 상품 {itemCount}개를 주문합니다.
          <br />
          최종 결제 금액을 확인해 주세요.
        </Typo>
      </Flex.Column>
      <Flex.Column as="ul" className={itemsListStyle}>
        {props.data.items.map((item) => (
          <Flex as="li" key={item.product.productId} alignItems="center" gap={24} py={8}>
            <Image width={112} height={112} radius="l" src={item.product.image} alt={item.product.name} />
            <Flex.Column gap={8}>
              <Flex.Column>
                <Typo size="s">{item.product.name}</Typo>
                <Typo size="xl" weight="bold">
                  {formatWon(item.product.price)}
                </Typo>
              </Flex.Column>
              <Typo as="span" size="s">
                {item.quantity}개
              </Typo>
            </Flex.Column>
          </Flex>
        ))}
      </Flex.Column>

      <Button onClick={handleClickOpenModal} disabled={updateMutation.status === 'loading' || orderQuery.isFetching}>
        쿠폰 적용
      </Button>

      <Flex.Column gap={10}>
        <Typo size="m" weight="bold">
          배송 정보
        </Typo>
        <Flex alignItems="center" gap={8}>
          <CheckBox
            id={remoteAreaInputId}
            checked={props.data.isRemoteArea}
            disabled={updateMutation.status === 'loading' || orderQuery.isFetching}
            onChange={(checked) => updateMutation.mutate({ isRemoteArea: checked })}
          />
          <Typo as="label" size="s" htmlFor={remoteAreaInputId}>
            제주도 및 도서 산간 지역
          </Typo>
        </Flex>
      </Flex.Column>
      <Flex.Column>
        <OrderAmountSummary
          amount={props.data.amount}
          isLoading={updateMutation.status === 'loading' || orderQuery.isFetching}
        />
        {errorMessage && (
          <Typo size="s" color="red-500" align="center">
            {errorMessage}
          </Typo>
        )}
      </Flex.Column>
      <View.CTA>
        <Button
          variant="cta"
          disabled={updateMutation.status === 'loading' || orderQuery.isFetching}
          onClick={handleClickPayment}
        >
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
