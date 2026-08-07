import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { StoryCard } from '@/components/StoryCard';
import { fetchPageContent } from '@/lib/content-api';
import { field, resolvePageFields } from '@/lib/page-content';
import { fetchPublicStories } from '@/lib/stories-api';
import type { Locale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

const STORIES_FIELDS = ['title', 'subtitle', 'ctaDonate', 'ctaDogs'] as const;

export default async function StoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('stories');
  const cms = await fetchPageContent('stories', locale);
  const c = resolvePageFields(STORIES_FIELDS, cms, t);
  const { items } = await fetchPublicStories(locale as Locale);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        {field(c, 'title')}
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-zinc-600">
        {field(c, 'subtitle')}
      </p>

      {items.length === 0 ? (
        <p className="mt-10 rounded-lg border border-zinc-200 bg-white p-8 text-zinc-600">
          {t('empty')}
        </p>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <StoryCard
              key={item.slug}
              item={item}
              readMoreLabel={t('readMore')}
              noPhotoLabel={t('noPhoto')}
            />
          ))}
        </ul>
      )}

      <section className="mt-12 border-t border-zinc-100 pt-10">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/donate"
            className="rounded-lg bg-amber-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-800"
          >
            {field(c, 'ctaDonate')}
          </Link>
          <Link
            href="/dogs"
            className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100"
          >
            {field(c, 'ctaDogs')}
          </Link>
        </div>
      </section>
    </main>
  );
}
