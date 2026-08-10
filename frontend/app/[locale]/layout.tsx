import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { Geist, Geist_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { SiteBackground } from '@/components/site-shell/SiteBackground';
import { SiteShellProvider } from '@/components/site-shell/SiteShellProvider';
import { getBranding } from '@/lib/branding-api';
import { cn } from '@/lib/cn';
import { routing, type Locale } from '@/i18n/routing';
import '../globals.css';

export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });

  return {
    title: t('name'),
    description: t('tagline'),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const branding = await getBranding();
  const heroImageUrl = branding?.heroImage?.url ?? null;
  const hasBackgroundImage = Boolean(heroImageUrl);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        data-site-bg={hasBackgroundImage ? '' : undefined}
        className={cn(
          'relative flex min-h-full flex-col text-zinc-900',
          hasBackgroundImage ? 'bg-zinc-900' : 'bg-zinc-50',
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <SiteShellProvider hasBackgroundImage={hasBackgroundImage}>
            <SiteBackground imageUrl={heroImageUrl} />
            <Header
              logoUrl={branding?.logo?.url ?? null}
              hasBackgroundImage={hasBackgroundImage}
            />
            <div className="flex flex-1 flex-col">{children}</div>
            <Footer hasBackgroundImage={hasBackgroundImage} />
          </SiteShellProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
