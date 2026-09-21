export type UserRole = 'ADMIN' | 'CASHIER' | 'COOK' | 'WAITER';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  CASHIER: 'Caixa',
  COOK: 'Cozinheiro',
  WAITER: 'Garçom',
};

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface TokenResponse {
  token: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ApiError {
  status?: number;
  message?: string;
}

export type ValidationErrors = Record<string, string>;

export interface JwtPayload {
  sub: string; // email
  iss: string;
  exp: number;
}
