import CartEmptyTemplate from '../components/templates/CartEmptyTemplate';
import CartErrorTemplate from '../components/templates/CartErrorTemplate';
import CartTemplate from '../components/templates/CartTemplate';
import CartSkeletonTemplate from '../components/templates/CartSkeletonTemplate';
import useCartItemsQuery from '../hooks/queries/useCartItemsQuery';

export default function CartPage() {
  const cartItemsQuery = useCartItemsQuery({
    onFail: () => alert('장바구니를 가져오지 못했어요'),
    onError: () => alert('장바구니를 가져오지 못했어요'),
  });
  const cartItems = cartItemsQuery.data ?? [];

  if (cartItemsQuery.status === 'idle' || cartItemsQuery.status === 'loading') return <CartSkeletonTemplate />;
  if (cartItemsQuery.status === 'fail' || cartItemsQuery.status === 'error') return <CartErrorTemplate />;
  if (cartItemsQuery.status === 'success' && cartItems.length === 0) return <CartEmptyTemplate />;

  return <CartTemplate data={cartItems} />;
}
