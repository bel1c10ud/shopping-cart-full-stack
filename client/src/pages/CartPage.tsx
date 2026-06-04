import CartEmpty from '../components/CartEmpty';
import CartError from '../components/CartError';
import CartLayout from '../components/CartLayout';
import CartSkeleton from '../components/CartSkeleton';
import useQuery from '../hooks/useQuery';
import type { APIResponse, CartItem } from '../types';

export default function CartPage() {
  const { data, refetch } = useQuery<APIResponse<CartItem[]>>({
    url: `${import.meta.env.VITE_API_URL}/cart`,
  });

  if (!data) return <CartSkeleton />;
  if (data && data.status === 'success' && data.data.length === 0) return <CartEmpty />;
  if (data && data.status === 'success') return <CartLayout data={data.data} refetchData={refetch} />;
  return <CartError />;
}
