export interface Product {
  productId: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

export interface CartItem extends Pick<Product, 'productId'> {
  cartItemId: string;
  quantity: number;
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

export interface CartItemWithProduct extends Pick<CartItem, 'cartItemId' | 'quantity'> {
  product: Product;
}

export interface ProductsServicePort {
  getProducts(): Promise<Product[]>;
  insertProduct(product: Omit<Product, 'productId'>): Promise<Product>;
  deleteProduct(productId: Product['productId']): Promise<Pick<Product, 'productId'>>;
}

export interface CartItemsServicePort {
  getCartItems(): Promise<CartItemWithProduct[]>;
  insertCartItem(cartItem: Omit<CartItem, 'cartItemId'>): Promise<CartItemWithProduct>;
  patchCartItem(
    cartItemId: CartItem['cartItemId'],
    cartItemPartial: Pick<CartItem, 'quantity'>,
  ): Promise<CartItemWithProduct>;
  deleteCartItem(cartItemId: CartItem['cartItemId']): Promise<Pick<CartItem, 'cartItemId'>>;
}
