import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { fetchPublicLostReport } from '@/lib/reports-api';

export const dynamic = 'force-dynamic';

export default async function LostDogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('lostDetail');
  const report = await fetchPublicLostReport(id);

  if (!report) {
    notFound();
  }

  const mapUrl =
    report.latitude && report.longitude
      ? `https://www.google.com/maps?q=${report.latitude},${report.longitude}`
      : null;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <Link
        href="/lost-dog"
        className="text-sm font-medium text-amber-800 hover:underline"
      >
        ← {t('backToList')}
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {t('title')}
        </h1>
        {report.verified ? (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-900">
            {t('verified')}
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-sm text-zinc-500">
        {new Date(report.createdAt).toLocaleString()}
      </p>

      <p className="mt-6 whitespace-pre-wrap text-zinc-700">{report.description}</p>

      {report.media.length > 0 ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {report.media.map((item) => (
            <li key={item.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt=""
                className="w-full rounded-lg border border-zinc-200 object-cover"
              />
            </li>
          ))}
        </ul>
      ) : null}

      <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">{t('contactTitle')}</h2>
        <dl className="mt-3 space-y-2 text-sm text-zinc-700">
          <div>
            <dt className="font-medium text-zinc-500">{t('contactName')}</dt>
            <dd>{report.reporterName}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">{t('contactPhone')}</dt>
            <dd>
              <a href={`tel:${report.reporterPhone}`} className="text-amber-800 hover:underline">
                {report.reporterPhone}
              </a>
            </dd>
          </div>
          {report.reporterEmail ? (
            <div>
              <dt className="font-medium text-zinc-500">{t('contactEmail')}</dt>
              <dd>
                <a
                  href={`mailto:${report.reporterEmail}`}
                  className="text-amber-800 hover:underline"
                >
                  {report.reporterEmail}
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      {mapUrl ? (
        <p className="mt-6">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-amber-800 hover:underline"
          >
            {t('openMap')}
          </a>
          {' · '}
          <Link href="/map" className="text-sm font-medium text-amber-800 hover:underline">
            {t('siteMap')}
          </Link>
        </p>
      ) : null}
    </main>
  );
}
