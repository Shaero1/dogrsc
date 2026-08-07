'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { listFoundReports, listLostReports } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { ReportListItem, ReportStatus } from '@/lib/reports-types';

type Tab = 'found' | 'lost';

function previewDescription(text: string, max = 80): string {
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max).trim()}…`;
}

export default function ReportsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('found');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('ALL');
  const [items, setItems] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadReports(activeTab: Tab, filter: ReportStatus | 'ALL') {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const params =
        filter === 'ALL' ? undefined : { status: filter as ReportStatus };
      const data =
        activeTab === 'found'
          ? await listFoundReports(token, params)
          : await listLostReports(token, params);
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReports(tab, statusFilter);
  }, [tab, statusFilter]);

  function openReport(report: ReportListItem) {
    const path =
      tab === 'found'
        ? `/reports/found/${report.id}`
        : `/reports/lost/${report.id}`;
    router.push(path);
  }

  return (
    <>
      <AdminHeader title="Reports" />
      <div className="flex-1 p-6">
        <p className="mb-4 text-sm text-zinc-600">
          Found and lost dog reports — published immediately on the public site.
          Hide spam or mark trusted reports as verified.
        </p>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-md border border-zinc-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setTab('found')}
              className={`rounded px-3 py-1.5 text-sm ${
                tab === 'found'
                  ? 'bg-amber-800 text-white'
                  : 'text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              Found
            </button>
            <button
              type="button"
              onClick={() => setTab('lost')}
              className={`rounded px-3 py-1.5 text-sm ${
                tab === 'lost'
                  ? 'bg-amber-800 text-white'
                  : 'text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              Lost
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as ReportStatus | 'ALL')
            }
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="VERIFIED">Verified</option>
            <option value="HIDDEN">Hidden</option>
          </select>
        </div>

        {loading ? <p className="text-sm text-zinc-500">Loading…</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {!loading && !error ? (
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left text-zinc-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Reporter</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {items.map((report) => (
                  <tr
                    key={report.id}
                    className="cursor-pointer border-t border-zinc-100 hover:bg-zinc-50"
                    onClick={() => openReport(report)}
                  >
                    <td className="max-w-xs px-4 py-3 text-zinc-800">
                      {previewDescription(report.description)}
                      {report.hasLocation ? (
                        <span className="ml-2 text-xs text-zinc-400">📍</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{report.reporterName}</td>
                    <td className="px-4 py-3">{report.reporterPhone}</td>
                    <td className="px-4 py-3">{report.status}</td>
                    <td className="px-4 py-3">
                      {new Date(report.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-zinc-500">
                No reports match this filter.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
