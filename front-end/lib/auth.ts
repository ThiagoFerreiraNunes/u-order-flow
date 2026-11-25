import type { JwtPayload } from '@/types/user';

const TOKEN_KEY = 'uorder_token';
const EMAIL_KEY = 'uorder_email';
const SESSION_COOKIE = 'uorder_logged_in';

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

export function saveUserSession(email: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(EMAIL_KEY, email);
  // Cookie for client/server middleware route protection (2h expiry)
  document.cookie = `${SESSION_COOKIE}=true; path=/; max-age=${2 * 60 * 60}; SameSite=Lax`;
}

export function saveToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${2 * 60 * 60}; SameSite=Lax`;
  const payload = decodeJwt<JwtPayload>(token);
  if (payload?.sub) {
    saveUserSession(payload.sub);
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearUserSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

export function removeToken(): void {
  clearUserSession();
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem(EMAIL_KEY) || localStorage.getItem(TOKEN_KEY));
}

export function getUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  const savedEmail = localStorage.getItem(EMAIL_KEY);
  if (savedEmail) return savedEmail;

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

export async function logout(): Promise<void> {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
    await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // Ignore network error on logout
  }
  clearUserSession();
  window.location.href = '/login';
}
