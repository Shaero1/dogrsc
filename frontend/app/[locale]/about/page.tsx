import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { fetchPageContent } from '@/lib/content-api';
import { field, resolvePageFields } from '@/lib/page-content';

export const dynamic = 'force-dynamic';

const ABOUT_FIELDS = [
  'title',
  'subtitle',
  'missionTitle',
  'missionBody',
  'workTitle',
  'workItem1',
  'workItem2',
  'workItem3',
  'helpTitle',
  'helpBody',
  'ctaDonate',
  'ctaDogs',
  'ctaFound',
] as const;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');
  const cms = await fetchPageContent('about', locale);
  const c = resolvePageFields(ABOUT_FIELDS, cms, t);

  const workItems = [field(c, 'workItem1'), field(c, 'workItem2'), field(c, 'workItem3')];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        {field(c, 'title')}
      </h1>
      <p className="mt-3 text-lg text-zinc-600">{field(c, 'subtitle')}</p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-zinc-900">
          {field(c, 'missionTitle')}
        </h2>
        <p className="mt-3 text-zinc-700">{field(c, 'missionBody')}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-zinc-900">{field(c, 'workTitle')}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-700">
          {workItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-zinc-900">{field(c, 'helpTitle')}</h2>
        <p className="mt-3 text-zinc-700">{field(c, 'helpBody')}</p>
        <div className="mt-6 flex flex-wrap gap-3">
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
          <Link
            href="/found-dog"
            className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-2.5 text-sm font-medium text-amber-900 hover:bg-amber-100"
          >
            {field(c, 'ctaFound')}
          </Link>
        </div>
      </section>
    </main>
  );
}
