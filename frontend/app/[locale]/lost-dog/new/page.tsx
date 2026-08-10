import { InnerMain } from '@/components/site-shell/InnerMain';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LostDogFormClient } from './LostDogFormClient';

export default async function LostDogNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('lostForm');

  return (
    <InnerMain
      maxWidth="6xl"
      solid
      header={
        <>
          <Link
            href="/lost-dog"
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
      <LostDogFormClient locale={locale} />
    </InnerMain>
  );
}
