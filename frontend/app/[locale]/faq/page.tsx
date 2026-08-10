import { InnerMain } from '@/components/site-shell/InnerMain';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { fetchPageContent } from '@/lib/content-api';
import { field, resolvePageFields } from '@/lib/page-content';

export const dynamic = 'force-dynamic';

const FAQ_FIELDS = [
  'title',
  'subtitle',
  'faq1Question',
  'faq1Answer',
  'faq2Question',
  'faq2Answer',
  'faq3Question',
  'faq3Answer',
  'faq4Question',
  'faq4Answer',
  'faq5Question',
  'faq5Answer',
  'ctaContact',
] as const;

const FAQ_ITEMS = [
  { questionKey: 'faq1Question', answerKey: 'faq1Answer' },
  { questionKey: 'faq2Question', answerKey: 'faq2Answer' },
  { questionKey: 'faq3Question', answerKey: 'faq3Answer' },
  { questionKey: 'faq4Question', answerKey: 'faq4Answer' },
  { questionKey: 'faq5Question', answerKey: 'faq5Answer' },
] as const;

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('faq');
  const cms = await fetchPageContent('faq', locale);
  const c = resolvePageFields(FAQ_FIELDS, cms, t);

  return (
    <InnerMain
      maxWidth="3xl"
      header={
        <>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            {field(c, 'title')}
          </h1>
          <p className="mt-3 text-lg text-zinc-600">{field(c, 'subtitle')}</p>
        </>
      }
    >
      <dl className="space-y-8">
        {FAQ_ITEMS.map((item) => (
          <div key={item.questionKey}>
            <dt className="text-lg font-semibold text-zinc-900">
              {field(c, item.questionKey)}
            </dt>
            <dd className="mt-2 text-zinc-700">{field(c, item.answerKey)}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-12 border-t border-zinc-200/80 pt-10">
        <Link
          href="/contact"
          className="text-sm font-medium text-amber-800 hover:underline"
        >
          {field(c, 'ctaContact')}
        </Link>
      </section>
    </InnerMain>
  );
}
