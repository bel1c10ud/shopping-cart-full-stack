import { ProductNotFoundError } from '../errors';
import { Order, OrderWithProduct, Product } from '../types';

export function toOrderItemsWithProducts(order: Order, products: Product[]): OrderWithProduct['items'] {
  return order.items.map((item) => {
    const product = products.find((product) => product.productId === item.productId);

    if (!product) throw new ProductNotFoundError(item.productId);

    return { product, quantity: item.quantity };
  });
}
