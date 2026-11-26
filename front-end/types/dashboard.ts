export interface TopProductResponse {
  productId: number;
  productName: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface DashboardAlertResponse {
  orderId: number;
  tableNumber: number | null;
  tableName: string | null;
  deliveredAt: string;
  message: string;
}

export interface DashboardSummaryResponse {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  averageTicket: number;
  topProducts: TopProductResponse[];
  recentAlerts: DashboardAlertResponse[];
}

export interface DashboardChartPoint {
  date: string;
  dayOfWeek: string;
  revenue: number;
}

export interface DashboardRevenueChartResponse {
  startDate: string;
  endDate: string;
  points: DashboardChartPoint[];
}
