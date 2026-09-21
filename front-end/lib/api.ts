import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  UserResponse,
  PageResponse,
  UserRole,
} from '@/types/user';
import { getToken } from './auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function buildHeaders(authenticated = false): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authenticated) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

/** POST /api/auth/login — public route */
export async function loginUser(data: LoginRequest): Promise<TokenResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

/** POST /api/auth/register — ADMIN only */
export async function registerUser(data: RegisterRequest): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
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

  const res = await fetch(`${BASE_URL}/api/users?${query.toString()}`, {
    headers: buildHeaders(true),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

/** DELETE /api/users/{id}/delete */
export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/users/${id}/delete`, {
    method: 'DELETE',
    headers: buildHeaders(true),
  });
  if (!res.ok) throw await res.json();
}
