import { useLocalStorage } from '../hooks/useLocalStorage';
import type { CartItem } from '../types';

export default function CartLayout({ data }: { data: CartItem[] }) {
  const { storage, setStorage } = useLocalStorage<Record<string, boolean>>(
    'woowacourse-mission-cart',
    Object.fromEntries(data.map((item) => [item.cartItemId, true])),
  );

  return (
    <div>
      <div>
        <h1>장바구니</h1>
        <h2>현재 {data.length}종류의 상품이 담겨있습니다.</h2>
      </div>
      <div>
        <input type="checkbox" checked={!Object.entries(storage).some((el) => !el[1])} />
        <div>전체선택</div>
      </div>
      <ul>
        {data.map((item) => (
          <li key={item.cartItemId}>
            <div>
              <input type="checkbox" checked={storage[item.cartItemId]} />
              <button>삭제</button>
            </div>
            <div>
              <img src={item.product.image} />
              <div>
                <div>{item.product.name}</div>
                <div>{item.product.price}</div>
                <div>
                  <button>-</button>
                  <div>{item.quantity}</div>
                  <button>+</button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
