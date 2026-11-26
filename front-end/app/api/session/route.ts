import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { UserRole } from '@/types/user';

interface JwtClaims {
  id?: number;
  sub?: string;
  role?: UserRole;
  exp?: number;
}

function decodeJwtPayload(token: string): JwtClaims | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = Buffer.from(part, 'base64url').toString('utf8');
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false, role: null, email: null, id: null }, { status: 200 });
  }

  const claims = decodeJwtPayload(token);
  if (!claims) {
    return NextResponse.json({ authenticated: false, role: null, email: null, id: null }, { status: 200 });
  }

  return NextResponse.json({
    authenticated: true,
    id: claims.id ?? null,
    email: claims.sub ?? null,
    role: claims.role ?? null,
  });
}
