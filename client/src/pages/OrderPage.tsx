import { useParams } from 'react-router';
import useOrderQuery from '../hooks/queries/useOrderQuery';
import OrderTemplate from '../components/templates/OrderTemplate';
import CommonErrorTemplate from '../components/templates/CommonErrorTemplate';
import CommonLoadingTemplate from '../components/templates/CommonLoadingTemplate';

export default function OrderPage() {
  const { orderId } = useParams();

  if (orderId === undefined) return <CommonErrorTemplate title="주문 확인" />;

  const orderQuery = useOrderQuery(orderId);

  if (orderQuery.status === 'idle' || orderQuery.status === 'loading')
    return <CommonLoadingTemplate title="주문 확인" />;
  if (orderQuery.status === 'fail' || orderQuery.status === 'error') return <CommonErrorTemplate title="주문 확인" />;
  if (orderQuery.status === 'success' && orderQuery.data) return <OrderTemplate data={orderQuery.data} />;
  return null;
}
