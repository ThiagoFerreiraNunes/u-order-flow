import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_KEY = 'uorder_token';
const PUBLIC_ROUTES = ['/login'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get(TOKEN_KEY)?.value;
  const { pathname } = request.nextUrl;

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

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
