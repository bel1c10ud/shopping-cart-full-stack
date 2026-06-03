export interface Product {
  productId: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

export interface CartItem {
  cartItemId: string;
  quantity: number;
  product: Product;
}

export interface APISuccessResponse<T> {
  status: 'success';
  data: T;
}

export interface APIFailResponse {
  status: 'fail';
  data: Record<string, string>;
}

export interface APIErrorResponse {
  status: 'error';
  message: string;
}

export type APIResponse<T> = APISuccessResponse<T> | APIFailResponse | APIErrorResponse;

// API 요청 데이터 형식
export interface AddProductRequest {
  name: string;
  price: number;
  image: string;
  stock: number;
}

export interface AddCartItemRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
