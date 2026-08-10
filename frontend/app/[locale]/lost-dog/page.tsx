import { InnerMain } from '@/components/site-shell/InnerMain';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ReportListCard } from '@/components/ReportListCard';
import { fetchPublicLostReports } from '@/lib/reports-api';

export const dynamic = 'force-dynamic';

export default async function LostDogListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('lostList');
  const { items } = await fetchPublicLostReports();

  return (
    <InnerMain
      maxWidth="6xl"
      header={
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              {t('title')}
            </h1>
            <p className="mt-2 max-w-2xl text-zinc-600">{t('subtitle')}</p>
          </div>
          <Link
            href="/lost-dog/new"
            className="rounded-lg bg-amber-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-800"
          >
            {t('addButton')}
          </Link>
        </div>
      }
    >
      {items.length === 0 ? (
        <p className="glass-empty-state">
          {t('empty')}{' '}
          <Link href="/lost-dog/new" className="font-medium text-amber-800 hover:underline">
            {t('addButton')}
          </Link>
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ReportListCard
              key={item.id}
              item={item}
              basePath="/lost-dog"
              noPhotoLabel={t('noPhoto')}
              viewLabel={t('viewReport')}
              verifiedLabel={t('verified')}
            />
          ))}
        </ul>
      )}
    </InnerMain>
  );
}
