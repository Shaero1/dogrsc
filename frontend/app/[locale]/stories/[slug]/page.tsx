import { InnerMain } from '@/components/site-shell/InnerMain';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { fetchPublicStoryBySlug } from '@/lib/stories-api';
import type { Locale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const story = await fetchPublicStoryBySlug(locale as Locale, slug);

  if (!story) {
    return {};
  }

  return {
    title: story.title,
    description: story.excerpt,
  };
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function StoryDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('stories');
  const story = await fetchPublicStoryBySlug(locale as Locale, slug);

  if (!story) {
    notFound();
  }

  return (
    <InnerMain
      maxWidth="3xl"
      header={
        <>
          <Link
            href="/stories"
            className="text-sm font-medium text-amber-800 hover:underline"
          >
            ← {t('backToList')}
          </Link>

          <time
            dateTime={story.publishedAt}
            className="mt-6 block text-xs font-medium uppercase tracking-wide text-zinc-500"
          >
            {formatDate(story.publishedAt, locale)}
          </time>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
            {story.title}
          </h1>
        </>
      }
    >
      {story.cover ? (
        <div className="overflow-hidden rounded-xl border border-zinc-200/80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={story.cover.url}
            alt=""
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      ) : null}

      <div className="mt-8 whitespace-pre-wrap text-zinc-700">{story.body}</div>

      {story.dogSlug ? (
        <Link
          href={`/dogs/${story.dogSlug}`}
          className="mt-8 inline-block text-sm font-medium text-amber-800 hover:underline"
        >
          {t('readDogProfile')}
        </Link>
      ) : null}
    </InnerMain>
  );
}
