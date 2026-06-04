import { useLocation } from 'react-router';
import OrderLayout from '../components/OrderLayout';

export default function OrderPage() {
  const { state } = useLocation();

  // TODO: state 검증

  return <OrderLayout data={state.products} />;
}
