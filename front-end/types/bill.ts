export type BillStatus = 'OPEN' | 'CLOSED' | 'PAID' | 'CANCELLED';

export interface BillSummaryResponse {
  id: number;
  customer: string;
  status: BillStatus;
  createdAt: string;
  restaurantTable?: number | null;
  totalPrice: string;
}

export interface BillOrderProductResponse {
  id: number;
  productName: string;
  unitPrice: string;
  quantity: number;
  note?: string;
  totalPrice: string;
}

export interface BillOrderResponse {
  id: number;
  status: string;
  employeeName: string;
  createdAt: string;
  items: BillOrderProductResponse[];
}

export interface BillDetailsResponse {
  id: number;
  customer: string;
  status: BillStatus;
  createdAt: string;
  paidAt?: string | null;
  restaurantTable?: number | null;
  totalPrice: string;
  orders: BillOrderResponse[];
}

export interface BillCreateRequest {
  customer: string;
  restaurantTableId?: number | null;
}

export interface BillUpdateRequest {
  customer?: string;
  restaurantTableId?: number | null;
}
