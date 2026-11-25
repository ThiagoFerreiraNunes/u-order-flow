import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_KEY = 'uorder_token';
const PUBLIC_ROUTES = ['/login'];

function extractRoleFromJwt(token: string | undefined): string | null {
  if (!token || !token.includes('.')) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const payload = JSON.parse(json) as { role?: string };
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;
  const token =
    accessToken ||
    request.cookies.get('uorder_logged_in')?.value ||
    request.cookies.get(TOKEN_KEY)?.value;
  const { pathname } = request.nextUrl;

  // Allow static assets, images, files with extensions, and Next internals
  if (
    pathname.includes('.') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  // Redirect root based on auth state
  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(token ? '/inicio' : '/login', request.url),
    );
  }

  // Unauthenticated user tries to access protected route
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Authenticated user tries to access auth route
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/inicio', request.url));
  }

  // Role-based route guards
  const role = extractRoleFromJwt(accessToken);
  if (role) {
    // Only ADMIN can access /contas
    if (pathname.startsWith('/contas') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/inicio', request.url));
    }
    // COOK cannot access /comandas
    if (pathname.startsWith('/comandas') && role === 'COOK') {
      return NextResponse.redirect(new URL('/pedidos', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static files with extensions (.png, .jpg, .jpeg, .svg, .webp, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
