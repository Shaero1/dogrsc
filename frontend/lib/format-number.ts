import { type Locale, routing } from '@/i18n/routing';

const LOCALE_TAGS: Record<Locale, string> = {
  en: 'en-US',
  th: 'th-TH',
  ru: 'ru-RU',
};

function isSupportedLocaleTag(tag: string): boolean {
  try {
    return Intl.NumberFormat.supportedLocalesOf([tag]).length > 0;
  } catch {
    return false;
  }
}

/**
 * Safe number formatting for SSR (Alpine Node may lack full ICU for short locale tags).
 */
export function formatNumber(value: number, locale: string): string {
  if (!Number.isFinite(value)) {
    return '0';
  }

  const rounded = Math.round(value);
  const appLocale = routing.locales.includes(locale as Locale)
    ? (locale as Locale)
    : routing.defaultLocale;
  const preferredTag = LOCALE_TAGS[appLocale];
  const fallbackTag = LOCALE_TAGS[routing.defaultLocale];

  for (const tag of [preferredTag, fallbackTag]) {
    if (!isSupportedLocaleTag(tag)) {
      continue;
    }

    try {
      return rounded.toLocaleString(tag);
    } catch {
      // try next tag
    }
  }

  return String(rounded);
}
