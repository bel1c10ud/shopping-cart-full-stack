import { useParams } from 'react-router';
import OrderCompleteTemplate from '../components/templates/OrderCompleteTemplate';
import CommonErrorTemplate from '../components/templates/CommonErrorTemplate';
import CommonLoadingTemplate from '../components/templates/CommonLoadingTemplate';
import useOrderQuery from '../hooks/queries/useOrderQuery';

export default function OrderCompletePage() {
  const { orderId } = useParams();

  if (orderId === undefined) return <CommonErrorTemplate title="" />;

  const orderQuery = useOrderQuery(orderId);

  if (orderQuery.status === 'idle' || orderQuery.status === 'loading') {
    return <CommonLoadingTemplate title="" />;
  }
  if (orderQuery.status === 'fail' || orderQuery.status === 'error') {
    return <CommonErrorTemplate title="" />;
  }
  if (orderQuery.status === 'success' && orderQuery.data) return <OrderCompleteTemplate data={orderQuery.data} />;

  return null;
}
