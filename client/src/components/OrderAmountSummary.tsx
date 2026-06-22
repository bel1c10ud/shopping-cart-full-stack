import type { AmountSummary } from '../types';
import AmountSummaryView from './AmountSummaryView';

interface OrderAmountSummaryProps {
  amount: AmountSummary;
  isLoading: boolean;
}

export default function OrderAmountSummary({ amount, isLoading }: OrderAmountSummaryProps) {
  return <AmountSummaryView amount={amount} isLoading={isLoading} showDiscount />;
}
