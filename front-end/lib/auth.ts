import type { JwtPayload } from '@/types/user';

const TOKEN_KEY = 'uorder_token';

/** Decode a JWT without external libraries */
function decodeJwt<T>(token: string): T | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload) as T;
  } catch {
    return null;
  }
}

export function saveToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  // Cookie for middleware route protection (2h expiry, same as JWT)
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${2 * 60 * 60}; SameSite=Lax`;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  const payload = decodeJwt<JwtPayload>(token);
  if (!payload) return false;
  return Date.now() < payload.exp * 1000;
}

export function getUserEmail(): string | null {
  const token = getToken();
  if (!token) return null;
  const payload = decodeJwt<JwtPayload>(token);
  return payload?.sub ?? null;
}

/** Returns uppercase initials from an email or name string */
export function getInitials(value: string | null): string {
  if (!value) return 'U';
  const parts = value.split(/[@.\s]/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function logout(): void {
  removeToken();
  window.location.href = '/login';
}
