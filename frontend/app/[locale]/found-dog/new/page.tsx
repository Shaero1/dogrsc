import { InnerMain } from '@/components/site-shell/InnerMain';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { FoundDogFormClient } from './FoundDogFormClient';

export default async function FoundDogNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('foundForm');

  return (
    <InnerMain
      maxWidth="6xl"
      solid
      header={
        <>
          <Link
            href="/found-dog"
            className="text-sm font-medium text-amber-800 hover:underline"
          >
            ← {t('backToList')}
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900">
            {t('title')}
          </h1>
          <p className="mt-2 max-w-2xl text-zinc-600">{t('subtitle')}</p>
        </>
      }
    >
      <FoundDogFormClient locale={locale} />
    </InnerMain>
  );
}
