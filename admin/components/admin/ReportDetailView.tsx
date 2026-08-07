'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  getFoundReport,
  getLostReport,
  updateFoundReportStatus,
  updateLostReportStatus,
} from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { ReportDetail, ReportStatus } from '@/lib/reports-types';

type ReportDetailViewProps = {
  kind: 'found' | 'lost';
  id: string;
};

function truncate(text: string, max = 120): string {
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max).trim()}…`;
}

export function ReportDetailView({ kind, id }: ReportDetailViewProps) {
  const router = useRouter();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const listHref = '/reports';
  const publicHref =
    kind === 'found'
      ? `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/en/found-dog/${id}`
      : `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/en/lost-dog/${id}`;

  useEffect(() => {
    async function load() {
      const token = getToken();
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        const data =
          kind === 'found'
            ? await getFoundReport(token, id)
            : await getLostReport(token, id);
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [kind, id]);

  async function handleStatus(status: ReportStatus) {
    const token = getToken();
    if (!token || !report) return;

    setActionId(status);
    setError(null);

    try {
      const updated =
        kind === 'found'
          ? await updateFoundReportStatus(token, id, { status })
          : await updateLostReportStatus(token, id, { status });
      setReport(updated);
      if (status === 'HIDDEN') {
        router.push(listHref);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setActionId(null);
    }
  }

  return (
    <>
      <AdminHeader
        title={kind === 'found' ? 'Found report' : 'Lost report'}
      />
      <div className="flex-1 p-6">
        <Link href={listHref} className="text-sm text-amber-800 hover:underline">
          ← Back to reports
        </Link>

        {loading ? <p className="mt-4 text-sm text-zinc-500">Loading…</p> : null}
        {error ? (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {!loading && report ? (
          <div className="mt-6 max-w-3xl space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-800">
                {report.status}
              </span>
              <span className="text-sm text-zinc-500">
                {new Date(report.createdAt).toLocaleString()}
              </span>
              <a
                href={publicHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-amber-800 hover:underline"
              >
                View on public site
              </a>
            </div>

            <section className="rounded-lg border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-zinc-900">Description</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">
                {report.description}
              </p>
            </section>

            <section className="rounded-lg border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-zinc-900">Reporter</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-zinc-500">Name</dt>
                  <dd>{report.reporterName}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Phone</dt>
                  <dd>{report.reporterPhone}</dd>
                </div>
                {report.reporterEmail ? (
                  <div>
                    <dt className="text-zinc-500">Email</dt>
                    <dd>{report.reporterEmail}</dd>
                  </div>
                ) : null}
              </dl>
            </section>

            {report.latitude && report.longitude ? (
              <section className="rounded-lg border border-zinc-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-zinc-900">Location</h2>
                <p className="mt-2 text-sm text-zinc-700">
                  {report.latitude}, {report.longitude}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm text-amber-800 hover:underline"
                >
                  Open in Google Maps
                </a>
              </section>
            ) : (
              <p className="text-sm text-zinc-500">No coordinates submitted.</p>
            )}

            {report.media.length > 0 ? (
              <section className="rounded-lg border border-zinc-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-zinc-900">Photos</h2>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                  {report.media.map((item) => (
                    <li key={item.id}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt=""
                        className="w-full rounded-md border border-zinc-200 object-cover"
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ) : (
              <p className="text-sm text-zinc-500">No photos attached.</p>
            )}

            <div className="flex flex-wrap gap-3">
              {report.status !== 'VERIFIED' ? (
                <button
                  type="button"
                  disabled={actionId !== null}
                  onClick={() => void handleStatus('VERIFIED')}
                  className="rounded-md border border-green-300 px-4 py-2 text-sm text-green-800 hover:bg-green-50 disabled:opacity-50"
                >
                  {actionId === 'VERIFIED' ? 'Updating…' : 'Mark verified'}
                </button>
              ) : null}
              {report.status !== 'ACTIVE' ? (
                <button
                  type="button"
                  disabled={actionId !== null}
                  onClick={() => void handleStatus('ACTIVE')}
                  className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50"
                >
                  {actionId === 'ACTIVE' ? 'Updating…' : 'Restore (active)'}
                </button>
              ) : null}
              {report.status !== 'HIDDEN' ? (
                <button
                  type="button"
                  disabled={actionId !== null}
                  onClick={() => void handleStatus('HIDDEN')}
                  className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-800 hover:bg-red-50 disabled:opacity-50"
                >
                  {actionId === 'HIDDEN' ? 'Hiding…' : 'Hide from site'}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

export function reportListPreview(description: string): string {
  return truncate(description);
}
