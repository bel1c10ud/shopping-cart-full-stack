import { useNavigate } from 'react-router';
import type { CartItem as TCartItem } from '../../types';
import CartItem from '../CartItem';
import useCartItemSelection from '../../hooks/useCartItemSelection';
import { useMemo } from 'react';
import useCalculateCartAmount from '../../hooks/useCalculateCartAmount';
import { formatWon } from '../../utils';

export default function CartTemplate(props: { data: TCartItem[]; refetchData: () => void }) {
  const navigate = useNavigate();

  const { selectedById, setSelected, setAllSelected } = useCartItemSelection(props.data);

  const selectedCartItems = useMemo(() => {
    return props.data.filter((cartItem) => selectedById[cartItem.cartItemId]);
  }, [props.data, selectedById]);

  const { orderAmount, shippingAmount, totalAmount } = useCalculateCartAmount(selectedCartItems);

  return (
    <div>
      <div>
        <h1>장바구니</h1>
        <h2>현재 {props.data.length}종류의 상품이 담겨있습니다.</h2>
      </div>
      <div>
        <input
          type="checkbox"
          checked={!Object.entries(selectedById).some((el) => !el[1])}
          onChange={(e) => setAllSelected(e.target.checked)}
        />
        <div>전체선택</div>
      </div>
      <ul>
        {props.data.map((item) => (
          <CartItem
            key={item.cartItemId}
            data={item}
            checked={selectedById[item.cartItemId]}
            onChangeChecked={(checked) => setSelected(item.cartItemId, checked)}
            onUpdate={props.refetchData}
            onDelete={props.refetchData}
          />
        ))}
      </ul>
      <ul>
        <li>
          <div>주문 금액</div>
          <div aria-label="주문 금액" data-value={orderAmount}>
            {formatWon(orderAmount)}
          </div>
        </li>
        <li>
          <div>배송비</div>
          <div aria-label="배송비" data-value={shippingAmount}>
            {formatWon(shippingAmount)}
          </div>
        </li>
        <li>
          <div>총 결제 금액</div>
          <div aria-label="총 결제 금액" data-value={totalAmount}>
            {formatWon(totalAmount)}
          </div>
        </li>
      </ul>
      <button
        onClick={() =>
          navigate('/order', {
            state: { products: props.data.filter((cur) => selectedById[cur.cartItemId]) },
          })
        }
        disabled={!Object.entries(selectedById).some((el) => el[1])}
      >
        주문 확인
      </button>
    </div>
  );
}
