import { useNavigate } from 'react-router';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../constants';
import type { CartItem } from '../types';

export default function OrderLayout(props: { data: CartItem[] }) {
  const navigate = useNavigate();

  const orderAmount = props.data.reduce((prev, cur) => prev + cur.quantity * cur.product.price, 0);

  const shippingAmount = orderAmount > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  const totalAmount = orderAmount + shippingAmount;

  return (
    <div>
      <button aria-label="뒤로가기" onClick={() => navigate(-1)}>
        {'<-'}
      </button>
      <h1>주문 확인</h1>
      <p>
        총 {props.data.length}종류의 상품 {props.data.reduce((prev, cur) => prev + cur.quantity, 0)}개를 주문합니다.
        <br />
        최종 결제 금액을 확인해 주세요.
      </p>
      <h2>총 결제 금액</h2>
      <h1>{totalAmount}원</h1>
      <button disabled>결제하기</button>
    </div>
  );
}
