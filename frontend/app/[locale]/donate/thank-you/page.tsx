import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { InnerMain } from '@/components/site-shell/InnerMain';

export default async function DonateThankYouPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('thankYou');

  return (
    <InnerMain maxWidth="2xl" className="py-16 text-center">
      <h1 className="text-3xl font-bold text-zinc-900">{t('title')}</h1>
      <p className="mt-4 text-zinc-600">{t('donateMessage')}</p>
      <Link
        href="/"
        className="mt-8 inline-block text-sm font-medium text-amber-800 hover:underline"
      >
        {t('backHome')}
      </Link>
    </InnerMain>
  );
}
