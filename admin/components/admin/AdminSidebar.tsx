'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchMe } from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth';
import { navItemsForRole } from '@/lib/nav-items';
import type { AdminUserRole } from '@/lib/users-types';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<AdminUserRole | null>(null);

  useEffect(() => {
    async function loadRole() {
      const token = getToken();
      if (!token) return;

      try {
        const me = await fetchMe(token);
        if (me.role === 'ADMIN' || me.role === 'STAFF') {
          setRole(me.role);
        }
      } catch {
        // AuthGate handles redirect
      }
    }

    void loadRole();
  }, []);

  function handleLogout() {
    clearToken();
    router.push('/login');
  }

  const items = role ? navItemsForRole(role) : [];

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-zinc-900 text-zinc-100">
      <div className="border-b border-zinc-700 px-4 py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Dog Rescue
        </p>
        <p className="text-lg font-semibold">Admin</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map(({ label, href }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-amber-700 text-white'
                  : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-700 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-md px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
