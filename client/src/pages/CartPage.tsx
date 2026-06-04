import CartEmptyTemplate from '../components/templates/CartEmptyTemplate';
import CartErrorTemplate from '../components/templates/CartErrorTemplate';
import CartTemplate from '../components/templates/CartTemplate';
import CartSkeletonTemplate from '../components/templates/CartSkeletonTemplate';
import useQuery from '../hooks/useQuery';
import type { APIResponse, CartItem } from '../types';

export default function CartPage() {
  const { data, refetch } = useQuery<APIResponse<CartItem[]>>({
    url: `${import.meta.env.VITE_API_URL}/cart`,
  });

  if (!data) return <CartSkeletonTemplate />;
  if (data && data.status === 'success' && data.data.length === 0) return <CartEmptyTemplate />;
  if (data && data.status === 'success') return <CartTemplate data={data.data} refetchData={refetch} />;
  return <CartErrorTemplate />;
}
