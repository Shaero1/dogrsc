import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { InnerMain } from '@/components/site-shell/InnerMain';
import { fetchPublicDogs } from '@/lib/api';
import type { Locale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

function statusLabel(
  t: Awaited<ReturnType<typeof getTranslations<'dogs'>>>,
  status: string,
) {
  if (status === 'AVAILABLE') return t('statusAvailable');
  if (status === 'IN_CARE') return t('statusInCare');
  return status;
}

export default async function DogsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('dogs');
  const { items } = await fetchPublicDogs(locale as Locale);

  return (
    <InnerMain
      maxWidth="6xl"
      header={
        <>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            {t('title')}
          </h1>
          <p className="mt-2 max-w-2xl text-zinc-600">{t('subtitle')}</p>
        </>
      }
    >
      {items.length === 0 ? (
        <p className="glass-empty-state">{t('empty')}</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((dog) => {
            const imageUrl = dog.media[0]?.url;

            return (
              <li key={dog.slug} className="glass-card">
                <div className="aspect-[4/3]">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="glass-card-media-empty">{t('noPhoto')}</div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-semibold text-zinc-900">
                      {dog.name}
                    </h2>
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                      {statusLabel(t, dog.status)}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm text-zinc-600">
                    {dog.description}
                  </p>
                  <Link
                    href={`/dogs/${dog.slug}`}
                    className="mt-4 inline-block text-sm font-medium text-amber-800 hover:underline"
                  >
                    {t('viewProfile')}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </InnerMain>
  );
}
