import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { HomeStatsSection } from '@/components/HomeStatsSection';
import { fetchPageContent } from '@/lib/content-api';
import { field, resolvePageFields } from '@/lib/page-content';
import { fetchHomeStats } from '@/lib/stats-api';

export const dynamic = 'force-dynamic';

const HOME_FIELDS = [
  'heroTitle',
  'heroSubtitle',
  'helpButton',
  'findDogButton',
  'reportFoundButton',
  'statsSectionEnabled',
  'statLabel',
] as const;

function isStatsEnabled(value: string | undefined): boolean {
  return value === 'true' || value === '1';
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const tSite = await getTranslations('site');
  const cms = await fetchPageContent('home', locale);
  const c = resolvePageFields(HOME_FIELDS, cms, t);

  const showStats = isStatsEnabled(field(c, 'statsSectionEnabled'));
  const stats = showStats ? await fetchHomeStats() : null;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-16">
      <p className="mb-2 text-sm font-medium uppercase tracking-wide text-amber-700">
        {tSite('name')}
      </p>
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
        {field(c, 'heroTitle')}
      </h1>
      <p className="mt-4 max-w-xl text-lg text-zinc-600">{tSite('tagline')}</p>
      <p className="mt-2 max-w-xl text-zinc-600">{field(c, 'heroSubtitle')}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/donate"
          className="rounded-lg bg-amber-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-800"
        >
          {field(c, 'helpButton')}
        </Link>
        <Link
          href="/dogs"
          className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100"
        >
          {field(c, 'findDogButton')}
        </Link>
        <Link
          href="/found-dog/new"
          className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-2.5 text-sm font-medium text-amber-900 hover:bg-amber-100"
        >
          {field(c, 'reportFoundButton')}
        </Link>
        <Link
          href="/lost-dog/new"
          className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100"
        >
          {t('reportLostButton')}
        </Link>
      </div>

      {showStats && stats ? (
        <HomeStatsSection
          value={stats.dogsTotal}
          label={field(c, 'statLabel')}
          locale={locale}
        />
      ) : null}
    </main>
  );
}
