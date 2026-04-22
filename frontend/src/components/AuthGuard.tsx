'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
    } else {
      // setState deferred to microtask to satisfy react-hooks/set-state-in-effect
      Promise.resolve().then(() => setReady(true));
    }
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}
