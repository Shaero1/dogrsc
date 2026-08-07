'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMe } from '@/lib/api';
import { getToken, isAuthenticated } from '@/lib/auth';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function check() {
      if (!isAuthenticated()) {
        router.replace('/login');
        return;
      }

      const token = getToken();
      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        await fetchMe(token);
        setReady(true);
      } catch {
        router.replace('/login');
      }
    }

    void check();
  }, [router]);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
        Checking session…
      </div>
    );
  }

  return <>{children}</>;
}
