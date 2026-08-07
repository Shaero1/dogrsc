import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ReportListCard } from '@/components/ReportListCard';
import { fetchPublicFoundReports } from '@/lib/reports-api';

export const dynamic = 'force-dynamic';

export default async function FoundDogListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('foundList');
  const { items } = await fetchPublicFoundReports();

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            {t('title')}
          </h1>
          <p className="mt-2 max-w-2xl text-zinc-600">{t('subtitle')}</p>
        </div>
        <Link
          href="/found-dog/new"
          className="rounded-lg bg-amber-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-800"
        >
          {t('addButton')}
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-10 rounded-lg border border-zinc-200 bg-white p-8 text-zinc-600">
          {t('empty')}{' '}
          <Link href="/found-dog/new" className="font-medium text-amber-800 hover:underline">
            {t('addButton')}
          </Link>
        </p>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ReportListCard
              key={item.id}
              item={item}
              basePath="/found-dog"
              noPhotoLabel={t('noPhoto')}
              viewLabel={t('viewReport')}
              verifiedLabel={t('verified')}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
