export interface TopProductResponse {
  productName: string;
  categoryName: string;
  totalSold: number;
}

export interface DashboardAlertResponse {
  type: string;
  title: string;
  description: string;
  createdAt: string;
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
  revenue: number;
}

export interface DashboardRevenueChartResponse {
  days: number;
  points: DashboardChartPoint[];
}
