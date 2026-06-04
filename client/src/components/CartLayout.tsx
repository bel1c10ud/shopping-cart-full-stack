import { useNavigate } from 'react-router';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { CartItem as TCartItem } from '../types';
import CartItem from './CartItem';

export default function CartLayout({ data, refetchData }: { data: TCartItem[]; refetchData: () => void }) {
  const navigate = useNavigate();

  const { storage, setStorage } = useLocalStorage<Record<string, boolean>>(
    'woowacourse-mission-cart',
    Object.fromEntries(data.map((item) => [item.cartItemId, true])),
  );

  // TODO: 추가된 상품에 대한 로컬 스토리지 상태 동기화 필요

  const orderAmount = data.reduce((prev, cur) => {
    if (storage[cur.cartItemId]) return prev + cur.quantity * cur.product.price;
    return prev;
  }, 0);

  const shippingAmount = orderAmount > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  const totalAmount = orderAmount + shippingAmount;

  const setCartItem = (key: string, checked: boolean) => {
    const newStorage = { ...storage };
    newStorage[key] = checked;
    setStorage(newStorage);
  };

  const setAllCartItem = (checked: boolean) => {
    const newStorage = { ...storage };
    Object.keys(newStorage).forEach((key) => (newStorage[key] = checked));
    setStorage(newStorage);
  };

  return (
    <div>
      <div>
        <h1>장바구니</h1>
        <h2>현재 {data.length}종류의 상품이 담겨있습니다.</h2>
      </div>
      <div>
        <input
          type="checkbox"
          checked={!Object.entries(storage).some((el) => !el[1])}
          onChange={(e) => setAllCartItem(e.target.checked)}
        />
        <div>전체선택</div>
      </div>
      <ul>
        {data.map((item) => (
          <CartItem
            key={item.cartItemId}
            data={item}
            isChecked={storage[item.cartItemId]}
            onChange={(e) => setCartItem(item.cartItemId, e.target.checked)}
            storage={storage}
            setStorage={setStorage}
            onUpdate={refetchData}
            onDelete={refetchData}
          />
        ))}
      </ul>
      <ul>
        <li>
          <div>주문 금액</div>
          <div aria-label="주문 금액" data-value={orderAmount}>
            {orderAmount}
          </div>
        </li>
        <li>
          <div>배송비</div>
          <div aria-label="배송비" data-value={shippingAmount}>
            {shippingAmount}
          </div>
        </li>
        <li>
          <div>총 결제 금액</div>
          <div aria-label="총 결제 금액" data-value={totalAmount}>
            {totalAmount}
          </div>
        </li>
      </ul>
      <button
        onClick={() =>
          navigate('/order', {
            state: { products: data.filter((cur) => storage[cur.cartItemId]) },
          })
        }
        disabled={!Object.entries(storage).some((el) => el[1])}
      >
        주문 확인
      </button>
    </div>
  );
}
