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
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
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
      <div className="mt-8">
        <FoundDogFormClient locale={locale} />
      </div>
    </main>
  );
}
