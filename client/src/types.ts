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

export interface UserCoupon {
  userCouponId: string;
  couponId: string;
  issuedAt: string;
  usedAt: string | null;
  usedOrderId: string | null;
}

export type OrderItem = {
  productId: Product['productId'];
  quantity: number;
};

export interface Order {
  orderId: string;
  status: 'PENDING' | 'PAID';
  isRemoteArea: boolean;
  items: OrderItem[];
  couponIds: UserCoupon['userCouponId'][];
}

export interface AmountSummary {
  orderAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
}

export interface OrderWithProduct {
  orderId: string;
  status: 'PENDING' | 'PAID';
  isRemoteArea: boolean;
  items: { product: Product; quantity: number }[];
  couponIds: string[];
  amount: AmountSummary;
}

export interface OrderCoupon {
  userCouponId: UserCoupon['userCouponId'];
  couponId: string;
  couponType: 'AMOUNT' | 'PERCENT';
  isDisabled: boolean;
  name: string;
  dueDate: string;
  minOrderAmount: number | null;
  availableTime: {
    startTime: string | null;
    endTime: string | null;
  };
}

export interface CouponRecommendation {
  couponIds: UserCoupon['userCouponId'][];
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
