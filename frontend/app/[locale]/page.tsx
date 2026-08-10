import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { HomeStatsSection } from '@/components/HomeStatsSection';
import { getBranding } from '@/lib/branding-api';
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
  const [cms, branding] = await Promise.all([
    fetchPageContent('home', locale),
    getBranding(),
  ]);
  const c = resolvePageFields(HOME_FIELDS, cms, t);

  const showStats = isStatsEnabled(field(c, 'statsSectionEnabled'));
  const stats = showStats ? await fetchHomeStats() : null;

  const hasHeroImage = Boolean(branding?.heroImage?.url);
  const textMutedClass = hasHeroImage ? 'text-zinc-200' : 'text-zinc-600';
  const textAccentClass = hasHeroImage ? 'text-amber-200' : 'text-amber-700';
  const titleClass = hasHeroImage ? 'text-white' : 'text-zinc-900';

  return (
    <section
      className={`relative flex w-full flex-1 flex-col justify-center overflow-hidden ${
        hasHeroImage ? 'min-h-[420px]' : ''
      }`}
    >
      <main className="relative mx-auto flex w-full max-w-6xl flex-col justify-center px-4 py-16">
        <p
          className={`mb-2 text-sm font-medium uppercase tracking-wide ${textAccentClass}`}
        >
          {tSite('name')}
        </p>
        <h1
          className={`max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl ${titleClass}`}
        >
          {field(c, 'heroTitle')}
        </h1>
        <p className={`mt-4 max-w-xl text-lg ${textMutedClass}`}>
          {tSite('tagline')}
        </p>
        <p className={`mt-2 max-w-xl ${textMutedClass}`}>
          {field(c, 'heroSubtitle')}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/donate"
            className="rounded-lg bg-amber-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-800"
          >
            {field(c, 'helpButton')}
          </Link>
          <Link
            href="/dogs"
            className={`rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-zinc-100 ${
              hasHeroImage
                ? 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                : 'border-zinc-300 bg-white text-zinc-800'
            }`}
          >
            {field(c, 'findDogButton')}
          </Link>
          <Link
            href="/found-dog/new"
            className={`rounded-lg border px-5 py-2.5 text-sm font-medium ${
              hasHeroImage
                ? 'border-amber-200/40 bg-amber-500/20 text-amber-50 hover:bg-amber-500/30'
                : 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
          >
            {field(c, 'reportFoundButton')}
          </Link>
          <Link
            href="/lost-dog/new"
            className={`rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-zinc-100 ${
              hasHeroImage
                ? 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                : 'border-zinc-300 bg-white text-zinc-800'
            }`}
          >
            {t('reportLostButton')}
          </Link>
        </div>

        {showStats && stats ? (
          <HomeStatsSection
            value={stats.dogsTotal}
            label={field(c, 'statLabel')}
            locale={locale}
            inverted={hasHeroImage}
          />
        ) : null}
      </main>
    </section>
  );
}
