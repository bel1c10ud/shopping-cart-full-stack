import { useLocation } from 'react-router';
import OrderTemplate from '../components/templates/OrderTemplate';

export default function OrderPage() {
  const { state } = useLocation();

  // TODO: state 검증

  return <OrderTemplate data={state.products} />;
}
