'use client';

import { useState, useEffect } from 'react';
import type { UserRole } from '@/types/user';

export interface ClientSession {
  authenticated: boolean;
  id: number | null;
  email: string | null;
  role: UserRole | null;
}

export function useSession() {
  const [session, setSession] = useState<ClientSession>({
    authenticated: false,
    id: null,
    email: null,
    role: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    fetch('/api/session', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ClientSession | null) => {
        if (!ignore && data) {
          setSession(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return { ...session, loading };
}
