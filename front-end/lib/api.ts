import type {
  LoginRequest,
  RegisterRequest,
  UserResponse,
  UserUpdateRequest,
  UserPasswordUpdateRequest,
  PageResponse,
  UserRole,
} from '@/types/user';
import type {
  DashboardSummaryResponse,
  DashboardRevenueChartResponse,
} from '@/types/dashboard';
import type {
  ProductCategoryResponse,
  ProductCategoryCreateRequest,
  ProductCategoryUpdateRequest,
  ProductSummaryResponse,
  ProductDetailsResponse,
  ProductCreateRequest,
  ProductUpdateRequest,
} from '@/types/product';
import type {
  RestaurantTableResponse,
  RestaurantTableCreateRequest,
  RestaurantTableUpdateRequest,
} from '@/types/table';
import type {
  BillSummaryResponse,
  BillDetailsResponse,
  BillCreateRequest,
  BillUpdateRequest,
} from '@/types/bill';
import type {
  OrderSummaryResponse,
  OrderDetailsResponse,
  OrderCreateRequest,
  OrderUpdateRequest,
} from '@/types/order';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  authenticated = true,
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  // Authentication is handled via the HttpOnly `access_token` cookie
  // sent automatically by the browser when credentials: 'include' is set.
  // Do NOT read localStorage or set Authorization header here.
  void authenticated; // kept for API compatibility

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      errorData = { status: res.status, message: res.statusText || 'Erro na requisição' };
    }
    throw errorData;
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as unknown as T;
  }

  const text = await res.text();
  if (!text) return undefined as unknown as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

/** POST /api/auth/login — sets HttpOnly access_token cookie */
export async function loginUser(data: LoginRequest): Promise<void> {
  await apiFetch<void>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }, false);
}

/** POST /api/auth/logout — invalidates access_token cookie */
export async function logoutUser(): Promise<void> {
  await apiFetch<void>('/api/auth/logout', {
    method: 'POST',
  }, false).catch(() => {});
}

/** POST /api/auth/register — ADMIN only */
export async function registerUser(data: RegisterRequest): Promise<void> {
  await apiFetch<void>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Users ───────────────────────────────────────────────────────────────────

export interface GetUsersParams {
  name?: string;
  isDeleted?: boolean;
  excludeRole?: UserRole;
  page?: number;
  size?: number;
}

/** GET /api/users — paginated user list */
export async function getUsers(
  params: GetUsersParams = {},
): Promise<PageResponse<UserResponse>> {
  const query = new URLSearchParams();
  if (params.name) query.set('name', params.name);
  if (params.isDeleted !== undefined) query.set('is-deleted', String(params.isDeleted));
  if (params.excludeRole) query.set('exclude-role', params.excludeRole);
  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.size !== undefined) query.set('size', String(params.size));

  const qs = query.toString();
  return apiFetch<PageResponse<UserResponse>>(`/api/users${qs ? `?${qs}` : ''}`);
}

/** GET /api/users/{id} */
export async function getUserById(id: number): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/users/${id}`);
}

/** PUT /api/users/{id} */
export async function updateUser(id: number, data: UserUpdateRequest): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** DELETE /api/users/{id} */
export async function deleteUser(id: number): Promise<void> {
  await apiFetch<void>(`/api/users/${id}`, {
    method: 'DELETE',
  });
}

/** PATCH /api/users/{id}/update-password */
export async function updateUserPassword(id: number, data: UserPasswordUpdateRequest): Promise<void> {
  await apiFetch<void>(`/api/users/${id}/update-password`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

/** GET /api/dashboard/summary */
export async function getDashboardSummary(date?: string): Promise<DashboardSummaryResponse> {
  const query = date ? `?date=${encodeURIComponent(date)}` : '';
  return apiFetch<DashboardSummaryResponse>(`/api/dashboard/summary${query}`);
}

/** GET /api/dashboard/revenue-chart */
export async function getDashboardRevenueChart(
  referenceDate?: string,
  days = 7,
): Promise<DashboardRevenueChartResponse> {
  const query = new URLSearchParams();
  if (referenceDate) query.set('referenceDate', referenceDate);
  query.set('days', String(days));
  return apiFetch<DashboardRevenueChartResponse>(`/api/dashboard/revenue-chart?${query.toString()}`);
}

// ─── Product Categories ──────────────────────────────────────────────────────

/** GET /api/product-categories */
export async function getProductCategories(): Promise<ProductCategoryResponse[]> {
  return apiFetch<ProductCategoryResponse[]>('/api/product-categories');
}

/** POST /api/product-categories */
export async function createProductCategory(
  data: ProductCategoryCreateRequest,
): Promise<ProductCategoryResponse> {
  return apiFetch<ProductCategoryResponse>('/api/product-categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** PUT /api/product-categories/{id} */
export async function updateProductCategory(
  id: number,
  data: ProductCategoryUpdateRequest,
): Promise<ProductCategoryResponse> {
  return apiFetch<ProductCategoryResponse>(`/api/product-categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** DELETE /api/product-categories/{id} */
export async function deleteProductCategory(id: number): Promise<void> {
  await apiFetch<void>(`/api/product-categories/${id}`, {
    method: 'DELETE',
  });
}

// ─── Products ────────────────────────────────────────────────────────────────

export interface GetProductsParams {
  name?: string;
  page?: number;
  size?: number;
}

/** GET /api/products */
export async function getProducts(
  params: GetProductsParams = {},
): Promise<PageResponse<ProductSummaryResponse>> {
  const query = new URLSearchParams();
  if (params.name) query.set('name', params.name);
  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.size !== undefined) query.set('size', String(params.size));

  const qs = query.toString();
  return apiFetch<PageResponse<ProductSummaryResponse>>(`/api/products${qs ? `?${qs}` : ''}`);
}

/** GET /api/products/{id} */
export async function getProductById(id: number): Promise<ProductDetailsResponse> {
  return apiFetch<ProductDetailsResponse>(`/api/products/${id}`);
}

/** POST /api/products */
export async function createProduct(data: ProductCreateRequest): Promise<ProductDetailsResponse> {
  return apiFetch<ProductDetailsResponse>('/api/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** PUT /api/products/{id} */
export async function updateProduct(
  id: number,
  data: ProductUpdateRequest,
): Promise<ProductDetailsResponse> {
  return apiFetch<ProductDetailsResponse>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** DELETE /api/products/{id} */
export async function deleteProduct(id: number): Promise<void> {
  await apiFetch<void>(`/api/products/${id}`, {
    method: 'DELETE',
  });
}

// ─── Restaurant Tables ───────────────────────────────────────────────────────

/** GET /api/restaurant-tables */
export async function getRestaurantTables(): Promise<RestaurantTableResponse[]> {
  return apiFetch<RestaurantTableResponse[]>('/api/restaurant-tables');
}

/** POST /api/restaurant-tables */
export async function createRestaurantTable(
  data: RestaurantTableCreateRequest,
): Promise<RestaurantTableResponse> {
  return apiFetch<RestaurantTableResponse>('/api/restaurant-tables', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** PUT /api/restaurant-tables/{id} */
export async function updateRestaurantTable(
  id: number,
  data: RestaurantTableUpdateRequest,
): Promise<RestaurantTableResponse> {
  return apiFetch<RestaurantTableResponse>(`/api/restaurant-tables/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** DELETE /api/restaurant-tables/{id} */
export async function deleteRestaurantTable(id: number): Promise<void> {
  await apiFetch<void>(`/api/restaurant-tables/${id}`, {
    method: 'DELETE',
  });
}

// ─── Bills (Comandas) ────────────────────────────────────────────────────────

export interface GetBillsParams {
  date?: string;
  page?: number;
  size?: number;
}

/** GET /api/bills */
export async function getBills(
  params: GetBillsParams = {},
): Promise<PageResponse<BillSummaryResponse>> {
  const query = new URLSearchParams();
  if (params.date) query.set('date', params.date);
  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.size !== undefined) query.set('size', String(params.size));

  const qs = query.toString();
  return apiFetch<PageResponse<BillSummaryResponse>>(`/api/bills${qs ? `?${qs}` : ''}`);
}

/** GET /api/bills/{id} */
export async function getBillById(id: number): Promise<BillDetailsResponse> {
  return apiFetch<BillDetailsResponse>(`/api/bills/${id}`);
}

/** POST /api/bills */
export async function createBill(data: BillCreateRequest): Promise<BillDetailsResponse> {
  return apiFetch<BillDetailsResponse>('/api/bills', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** PUT /api/bills/{id} */
export async function updateBill(id: number, data: BillUpdateRequest): Promise<BillDetailsResponse> {
  return apiFetch<BillDetailsResponse>(`/api/bills/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** PATCH /api/bills/{id}/close */
export async function closeBill(id: number): Promise<BillDetailsResponse> {
  return apiFetch<BillDetailsResponse>(`/api/bills/${id}/close`, {
    method: 'PATCH',
  });
}

/** PATCH /api/bills/{id}/pay */
export async function payBill(id: number): Promise<BillDetailsResponse> {
  return apiFetch<BillDetailsResponse>(`/api/bills/${id}/pay`, {
    method: 'PATCH',
  });
}

/** PATCH /api/bills/{id}/cancel */
export async function cancelBill(id: number): Promise<BillDetailsResponse> {
  return apiFetch<BillDetailsResponse>(`/api/bills/${id}/cancel`, {
    method: 'PATCH',
  });
}

/** POST /api/bills/{billId}/orders */
export async function createBillOrder(
  billId: number,
  data: OrderCreateRequest,
): Promise<OrderDetailsResponse> {
  return apiFetch<OrderDetailsResponse>(`/api/bills/${billId}/orders`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export interface GetOrdersParams {
  page?: number;
  size?: number;
}

/** GET /api/orders */
export async function getOrders(
  params: GetOrdersParams = {},
): Promise<PageResponse<OrderSummaryResponse>> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.size !== undefined) query.set('size', String(params.size));

  const qs = query.toString();
  return apiFetch<PageResponse<OrderSummaryResponse>>(`/api/orders${qs ? `?${qs}` : ''}`);
}

/** GET /api/orders/{id} */
export async function getOrderById(id: number): Promise<OrderDetailsResponse> {
  return apiFetch<OrderDetailsResponse>(`/api/orders/${id}`);
}

/** PUT /api/orders/{id} */
export async function updateOrder(
  id: number,
  data: OrderUpdateRequest,
): Promise<OrderDetailsResponse> {
  return apiFetch<OrderDetailsResponse>(`/api/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** PATCH /api/orders/{id}/prepare */
export async function prepareOrder(id: number): Promise<OrderDetailsResponse> {
  return apiFetch<OrderDetailsResponse>(`/api/orders/${id}/prepare`, {
    method: 'PATCH',
  });
}

/** PATCH /api/orders/{id}/deliver */
export async function deliverOrder(id: number): Promise<OrderDetailsResponse> {
  return apiFetch<OrderDetailsResponse>(`/api/orders/${id}/deliver`, {
    method: 'PATCH',
  });
}

/** PATCH /api/orders/{id}/cancel */
export async function cancelOrder(id: number): Promise<OrderDetailsResponse> {
  return apiFetch<OrderDetailsResponse>(`/api/orders/${id}/cancel`, {
    method: 'PATCH',
  });
}
