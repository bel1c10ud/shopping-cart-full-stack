import CartEmptyTemplate from '../components/templates/CartEmptyTemplate';
import CartErrorTemplate from '../components/templates/CartErrorTemplate';
import CartTemplate from '../components/templates/CartTemplate';
import CartSkeletonTemplate from '../components/templates/CartSkeletonTemplate';
import useCartItems from '../hooks/useCartItems';

export default function CartPage() {
  const {
    status,
    optimisticCartItems,
    OptimisticUpdateCartItemQuantity,
    OptimisticDeleteCartItem,
    selectedById,
    setSelected,
    setAllSelected,
  } = useCartItems();

  if (status === 'idle' || status === 'loading') return <CartSkeletonTemplate />;
  if (status === 'fail' || status === 'error') return <CartErrorTemplate />;
  if (status === 'success' && optimisticCartItems.length === 0) return <CartEmptyTemplate />;

  return (
    <CartTemplate
      data={optimisticCartItems}
      selectedById={selectedById}
      onSelect={setSelected}
      onSelectAll={setAllSelected}
      onUpdateCartItemQuantity={OptimisticUpdateCartItemQuantity}
      onDeleteCartItem={OptimisticDeleteCartItem}
    />
  );
}
