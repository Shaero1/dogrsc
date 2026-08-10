import { InnerMain } from '@/components/site-shell/InnerMain';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ReportsMap } from '@/components/ReportsMap';
import { fetchMapMarkers } from '@/lib/map-api';

export const dynamic = 'force-dynamic';

export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('map');
  const { items } = await fetchMapMarkers();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

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
      <div className="glass-map-frame">
        <ReportsMap markers={items} apiKey={apiKey} />
      </div>
    </InnerMain>
  );
}
