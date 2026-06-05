import { useNavigate } from 'react-router';
import type { CartItem as TCartItem } from '../../types';
import CartItem from '../CartItem';
import useCartItemSelection from '../../hooks/useCartItemSelection';
import { useMemo } from 'react';
import useCalculateCartAmount from '../../hooks/useCalculateCartAmount';
import { formatWon } from '../../utils';
import Typo from '../common/Typo';
import Flex from '../common/Flex';
import View from '../common/View';
import Button from '../common/Button';
import CheckBox from '../common/CheckBox';
import List from '../common/List';
import Image from '../common/Image';

export default function CartTemplate(props: { data: TCartItem[]; refetchData: () => void }) {
  const navigate = useNavigate();

  const { selectedById, setSelected, setAllSelected } = useCartItemSelection(props.data);

  const selectedCartItems = useMemo(() => {
    return props.data.filter((cartItem) => selectedById[cartItem.cartItemId]);
  }, [props.data, selectedById]);

  const { orderAmount, shippingAmount, totalAmount } = useCalculateCartAmount(selectedCartItems);

  return (
    <View gap={24}>
      <Flex direction="column">
        <Typo as="h1" size="xl" weight="bold">
          장바구니
        </Typo>
        <Typo as="h2" size="s">
          현재 {props.data.length}종류의 상품이 담겨있습니다.
        </Typo>
      </Flex>
      <List
        divider={{ header: true, item: true }}
        header={
          <Flex alignItems="center" gap={8} py={16}>
            <CheckBox
              id="check-all"
              checked={!Object.entries(selectedById).some((el) => !el[1])}
              onChange={setAllSelected}
            />
            <Typo as="label" size="s" htmlFor="check-all">
              전체선택
            </Typo>
          </Flex>
        }
      >
        {props.data.map((item) => (
          <CartItem
            key={item.cartItemId}
            data={item}
            checked={selectedById[item.cartItemId]}
            onSelect={(checked) => setSelected(item.cartItemId, checked)}
            onUpdate={props.refetchData}
            onDelete={props.refetchData}
          />
        ))}
      </List>
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
      <View.CTA>
        <Button
          variant="cta"
          onClick={() =>
            navigate('/order', {
              state: { products: props.data.filter((cur) => selectedById[cur.cartItemId]) },
            })
          }
          disabled={!Object.entries(selectedById).some((el) => el[1])}
        >
          주문 확인
        </Button>
      </View.CTA>
    </View>
  );
}
