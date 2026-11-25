export type OrderStatus = 'WAITING' | 'PREPARING' | 'DELIVERED' | 'CANCELLED';

export interface OrderItemCreateRequest {
  productId: number;
  note?: string;
  quantity: number;
}

export interface OrderCreateRequest {
  employeeId?: number;
  items: OrderItemCreateRequest[];
}

export interface OrderUpdateRequest {
  employeeId?: number;
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
  id: number;
  productName: string;
  unitPrice: string;
  quantity: number;
  note?: string;
  totalPrice: string;
}

export interface OrderDetailsResponse {
  id: number;
  status: string;
  createdAt: string;
  deliveredAt?: string | null;
  customer: string;
  employee: string;
  restaurantTable?: number | null;
  items: OrderProductDetailsResponse[];
}
