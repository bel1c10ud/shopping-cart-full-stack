export interface Product {
  productId: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

export interface CartItem {
  cartItemId: string;
  isSelected: boolean;
  productId: Product['productId'];
  quantity: number;
}

export interface OrderItem {
  productId: Product['productId'];
  quantity: number;
}

export interface Order {
  orderId: string;
  status: 'PENDING' | 'PAID';
  isRemoteArea: boolean;
  items: OrderItem[];
  couponIds: string[];
}

export interface ProductsRepository {
  getAll(): Promise<Product[]>;
  insert(product: Omit<Product, 'productId'>): Promise<Product>;
  getById(productId: Product['productId']): Promise<Product | undefined>;
  deleteById(productId: Product['productId']): Promise<Product | null>;
}

export interface CartItemsRepository {
  getAll(): Promise<CartItem[]>;
  getById(cartItemId: CartItem['cartItemId']): Promise<CartItem | undefined>;
  insertByUser(cartItem: Omit<CartItem, 'cartItemId'>): Promise<CartItem>;
  updateById(cartItemId: CartItem['cartItemId'], cartItem: CartItem): Promise<CartItem | undefined>;
  deleteById(cartItemId: CartItem['cartItemId']): Promise<Pick<CartItem, 'cartItemId'> | null>;
}

export interface OrdersRepository {
  getById(orderId: Order['orderId']): Promise<Order | undefined>;
}

export interface CartItemWithProduct extends Omit<CartItem, 'productId'> {
  product: Product;
}

export interface OrderWithProduct extends Omit<Order, 'items'> {
  items: { product: Product; quantity: OrderItem['quantity'] }[];
  amount: AmountSummary;
}

export interface AmountSummary {
  orderAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
}

export interface ProductsServicePort {
  getProducts(): Promise<Product[]>;
  insertProduct(product: Omit<Product, 'productId'>): Promise<Product>;
  deleteProduct(productId: Product['productId']): Promise<Pick<Product, 'productId'>>;
}

export interface CartItemsServicePort {
  getCartItems(): Promise<CartItemWithProduct[]>;
  getCartAmount(): Promise<AmountSummary>;
  insertCartItem(cartItem: Omit<CartItem, 'cartItemId' | 'isSelected'>): Promise<CartItemWithProduct>;
  patchCartItem(
    cartItemId: CartItem['cartItemId'],
    cartItemPartial: Partial<Omit<CartItem, 'productId' | 'cartItemId'>>,
  ): Promise<CartItemWithProduct>;
  deleteCartItem(cartItemId: CartItem['cartItemId']): Promise<Pick<CartItem, 'cartItemId'>>;
}

export interface OrdersServicePort {
  getOrderById(orderId: Order['orderId']): Promise<OrderWithProduct>;
}
