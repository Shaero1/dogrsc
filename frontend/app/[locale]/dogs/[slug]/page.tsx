import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { fetchPublicDogBySlug } from '@/lib/api';
import type { Locale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const dog = await fetchPublicDogBySlug(locale as Locale, slug);

  if (!dog) {
    return {};
  }

  return {
    title: dog.seoTitle || dog.name,
    description: dog.seoDescription || dog.description,
  };
}

function statusLabel(
  t: Awaited<ReturnType<typeof getTranslations<'dogs'>>>,
  status: string,
) {
  if (status === 'AVAILABLE') return t('statusAvailable');
  if (status === 'IN_CARE') return t('statusInCare');
  return status;
}

export default async function DogProfilePage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('dogs');
  const dog = await fetchPublicDogBySlug(locale as Locale, slug);

  if (!dog) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
      <Link
        href="/dogs"
        className="text-sm font-medium text-amber-800 hover:underline"
      >
        ← {t('backToList')}
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {dog.name}
        </h1>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">
          {statusLabel(t, dog.status)}
        </span>
      </div>

      {dog.media.length > 0 ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {dog.media.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
            </li>
          ))}
        </ul>
      ) : null}

      <section className="mt-8 space-y-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {t('about')}
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-zinc-700">
            {dog.description}
          </p>
        </div>

        {dog.rescueStory ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              {t('rescueStory')}
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-zinc-700">
              {dog.rescueStory}
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
