import type { ProductSummaryResponse } from './product';
import type { RestaurantTableResponse } from './table';
import type { UserResponse } from './user';

export type OrderStatus = 'WAITING' | 'PREPARING' | 'DELIVERED' | 'CANCELLED';

export interface OrderItemCreateRequest {
  productId: number;
  note?: string;
  quantity: number;
}

export interface OrderCreateRequest {
  employeeId: number;
  items: OrderItemCreateRequest[];
}

export interface OrderUpdateRequest {
  employeeId: number;
  items: OrderItemCreateRequest[];
}

export interface OrderSummaryResponse {
  id: number;
  status: string;
  createdAt: string;
  customer: string;
  employee: string;
  restaurantTable?: number | null;
  totalPrice: string;
}

export interface OrderProductDetailsResponse {
  product: ProductSummaryResponse;
  note?: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface OrderDetailsResponse {
  id: number;
  status: string;
  createdAt: string;
  deliveredAt?: string | null;
  customer: string;
  employee: UserResponse;
  restaurantTable?: RestaurantTableResponse | null;
  totalPrice: string;
  items: OrderProductDetailsResponse[];
}
