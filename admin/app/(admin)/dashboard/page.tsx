'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { fetchDashboardStats } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { DashboardStats } from '@/lib/dashboard-types';

const statCards: Array<{
  key: keyof DashboardStats;
  label: string;
  format?: (value: number) => string;
}> = [
  { key: 'dogsUnderCare', label: 'Dogs under care' },
  { key: 'reportsActive', label: 'Live reports' },
  {
    key: 'donationsThisMonth',
    label: 'Donations (month)',
    format: (value) => `${value.toLocaleString()} THB`,
  },
  { key: 'dogsAvailable', label: 'Dogs available' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const token = getToken();
      if (!token) return;

      try {
        const data = await fetchDashboardStats(token);
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <>
      <AdminHeader title="Dashboard" />
      <div className="flex-1 p-6">
        <p className="mb-6 text-sm text-zinc-600">
          Overview of dogs, moderation queue, and confirmed donations this month.
        </p>

        {loading ? <p className="text-sm text-zinc-500">Loading…</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {!loading && !error && stats ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map(({ key, label, format }) => (
                <div
                  key={key}
                  className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <p className="text-sm text-zinc-500">{label}</p>
                  <p className="mt-1 text-2xl font-semibold text-zinc-900">
                    {format ? format(stats[key]) : stats[key]}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm">
              <Link href="/reports" className="text-amber-800 hover:underline">
                Moderate reports
              </Link>
              <Link href="/dogs" className="text-amber-800 hover:underline">
                Manage dogs
              </Link>
              <Link href="/donations" className="text-amber-800 hover:underline">
                Crypto addresses
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
