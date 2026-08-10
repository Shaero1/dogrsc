import { getTranslations, setRequestLocale } from 'next-intl/server';
import { InnerMain } from '@/components/site-shell/InnerMain';
import { fetchCryptoAddresses } from '@/lib/donate-api';
import { fetchPageContent } from '@/lib/content-api';
import { resolvePageFields } from '@/lib/page-content';
import { DonatePageClient } from './DonatePageClient';

export const dynamic = 'force-dynamic';

const DONATE_PAGE_FIELDS = ['title', 'subtitle'] as const;
const BANK_FIELDS = [
  'bankAccountName',
  'bankName',
  'bankAccountNumber',
  'bankNote',
] as const;

export default async function DonatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('donate');
  const { items } = await fetchCryptoAddresses();
  const bankCms = await fetchPageContent('donate-bank', locale);
  const bankResolved = resolvePageFields(BANK_FIELDS, bankCms, t);
  const bankContent = {
    bankAccountName: bankResolved.bankAccountName,
    bankName: bankResolved.bankName,
    bankAccountNumber: bankResolved.bankAccountNumber,
    bankNote: bankResolved.bankNote,
  };
  const pageContent = resolvePageFields(DONATE_PAGE_FIELDS, null, t);

  return (
    <InnerMain
      maxWidth="3xl"
      solid
      header={
        <>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            {pageContent.title}
          </h1>
          <p className="mt-2 text-zinc-600">{pageContent.subtitle}</p>
        </>
      }
    >
      <DonatePageClient
        locale={locale}
        cryptoItems={items}
        bankContent={bankContent}
      />
    </InnerMain>
  );
}
