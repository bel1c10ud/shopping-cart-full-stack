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

export interface Coupon {
  couponId: string;
  couponType: 'AMOUNT' | 'PERCENT';
  code: string;
  name: string;
  expiresAt: string;

  minOrderAmount: number | null;
  minItemCount: number | null;

  orderAmountDiscountType: 'NONE' | 'AMOUNT' | 'PERCENT';
  orderAmountDiscountValue: number | null;

  shippingFeeDiscountType: 'NONE' | 'FREE' | 'AMOUNT';
  shippingFeeDiscountValue: number | null;

  remoteAreaFeeDiscountType: 'NONE' | 'FREE' | 'AMOUNT';
  remoteAreaFeeDiscountValue: number | null;

  itemDiscountType: 'NONE' | 'FREE_COUNT';
  itemDiscountValue: number | null;

  availableTimeStart: string | null;
  availableTimeEnd: string | null;
}

export interface UserCoupon {
  userCouponId: string;
  couponId: string;
  issuedAt: string;
  usedAt: string | null;
  usedOrderId: string | null;
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
  couponIds: UserCoupon['userCouponId'][];
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

export interface CouponsRepository {
  getCoupons(): Promise<Coupon[]>;
  getUserCoupons(): Promise<UserCoupon[]>;
}

export interface OrdersRepository {
  getById(orderId: Order['orderId']): Promise<Order | undefined>;
  insert(order: Omit<Order, 'orderId'>): Promise<Order>;
  updateById(orderId: Order['orderId'], order: Order): Promise<Order | undefined>;
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
  insertOrder(items: OrderItem[]): Promise<OrderWithProduct>;
  getOrderAmount(
    orderId: Order['orderId'],
    orderPartial: Partial<Pick<Order, 'isRemoteArea' | 'couponIds'>>,
  ): Promise<AmountSummary>;
  patchOrder(
    orderId: Order['orderId'],
    orderPartial: Partial<Pick<Order, 'isRemoteArea' | 'couponIds'>>,
  ): Promise<OrderWithProduct>;
}
