import type { OrderSummaryResponse } from './order';

export type BillStatus = 'OPEN' | 'CLOSED' | 'PAID' | 'CANCELLED';

export interface BillSummaryResponse {
  id: number;
  customer: string;
  status: BillStatus;
  createdAt: string;
  restaurantTable?: number | null;
  totalPrice: string;
}

export interface BillDetailsResponse {
  id: number;
  customer: string;
  status: BillStatus;
  createdAt: string;
  paidAt?: string | null;
  restaurantTable?: number | null;
  totalPrice: string;
  orders: OrderSummaryResponse[];
}

export interface BillCreateRequest {
  customer: string;
  restaurantTableId?: number | null;
}

export interface BillUpdateRequest {
  customer?: string;
  restaurantTableId?: number | null;
}
