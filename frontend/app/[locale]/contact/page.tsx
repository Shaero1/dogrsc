import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { fetchPageContent } from '@/lib/content-api';
import { field, resolvePageFields } from '@/lib/page-content';

export const dynamic = 'force-dynamic';

const CONTACT_FIELDS = [
  'title',
  'subtitle',
  'reachTitle',
  'emailLabel',
  'emailValue',
  'phoneLabel',
  'phoneValue',
  'lineLabel',
  'lineValue',
  'socialTitle',
  'facebookLabel',
  'facebookUrl',
  'instagramLabel',
  'instagramUrl',
  'telegramLabel',
  'telegramUrl',
  'hoursTitle',
  'hoursBody',
  'addressTitle',
  'addressBody',
  'noteBody',
  'ctaFound',
] as const;

const SOCIAL_LINKS = [
  { labelKey: 'facebookLabel', urlKey: 'facebookUrl' },
  { labelKey: 'instagramLabel', urlKey: 'instagramUrl' },
  { labelKey: 'telegramLabel', urlKey: 'telegramUrl' },
] as const;

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contact');
  const cms = await fetchPageContent('contact', locale);
  const c = resolvePageFields(CONTACT_FIELDS, cms, t);

  const socialItems = SOCIAL_LINKS.map(({ labelKey, urlKey }) => ({
    label: field(c, labelKey),
    url: field(c, urlKey).trim(),
  })).filter((item) => item.url.length > 0);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        {field(c, 'title')}
      </h1>
      <p className="mt-3 text-lg text-zinc-600">{field(c, 'subtitle')}</p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-zinc-900">{field(c, 'reachTitle')}</h2>
        <dl className="mt-4 space-y-4 text-sm">
          <div>
            <dt className="font-medium text-zinc-900">{field(c, 'emailLabel')}</dt>
            <dd className="mt-1">
              <a
                href={`mailto:${field(c, 'emailValue')}`}
                className="text-amber-800 hover:underline"
              >
                {field(c, 'emailValue')}
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-900">{field(c, 'phoneLabel')}</dt>
            <dd className="mt-1">
              <a
                href={`tel:${field(c, 'phoneValue').replace(/\s/g, '')}`}
                className="text-amber-800 hover:underline"
              >
                {field(c, 'phoneValue')}
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-900">{field(c, 'lineLabel')}</dt>
            <dd className="mt-1 text-zinc-700">{field(c, 'lineValue')}</dd>
          </div>
        </dl>
      </section>

      {socialItems.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-zinc-900">
            {field(c, 'socialTitle')}
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {socialItems.map((item) => (
              <li key={item.url}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-amber-800 hover:underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-zinc-900">{field(c, 'hoursTitle')}</h2>
        <p className="mt-3 text-zinc-700">{field(c, 'hoursBody')}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-zinc-900">{field(c, 'addressTitle')}</h2>
        <p className="mt-3 whitespace-pre-line text-zinc-700">{field(c, 'addressBody')}</p>
      </section>

      <section className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-950">{field(c, 'noteBody')}</p>
        <Link
          href="/found-dog"
          className="mt-4 inline-block text-sm font-medium text-amber-900 hover:underline"
        >
          {field(c, 'ctaFound')}
        </Link>
      </section>
    </main>
  );
}
