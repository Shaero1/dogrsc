'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

const localeLabels: Record<Locale, string> = {
  en: 'English',
  th: 'ไทย',
  ru: 'Русский',
};

export function LocaleSwitcher() {
  const t = useTranslations('footer');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value as Locale;
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <label className="flex items-center gap-2 text-sm text-zinc-600">
      <span>{t('language')}:</span>
      <select
        value={locale}
        onChange={onChange}
        className="rounded border border-zinc-300 bg-white px-2 py-1 text-zinc-900"
        aria-label={t('language')}
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeLabels[loc]}
          </option>
        ))}
      </select>
    </label>
  );
}
