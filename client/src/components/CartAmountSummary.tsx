import useCartAmountQuery from '../hooks/queries/useCartAmountQuery';
import AmountSummaryView from './AmountSummaryView';

const emptyAmount = {
  orderAmount: 0,
  shippingAmount: 0,
  discountAmount: 0,
  totalAmount: 0,
};

export default function CartAmountSummary() {
  const cartAmountQuery = useCartAmountQuery();
  const amount = cartAmountQuery.data ?? emptyAmount;

  return <AmountSummaryView amount={amount} isLoading={cartAmountQuery.isFetching} valueSize="l" />;
}
