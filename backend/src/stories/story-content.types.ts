export type StoryLocaleContent = {
  title?: string;
  body?: string;
};

export type StoryContent = {
  en?: StoryLocaleContent;
  th?: StoryLocaleContent;
  ru?: StoryLocaleContent;
};

export type SupportedLocale = 'en' | 'th' | 'ru';

const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'th', 'ru'];

export function parseAcceptLanguage(
  header: string | undefined,
): SupportedLocale {
  if (!header) {
    return 'en';
  }

  const primary = header.split(',')[0]?.trim().toLowerCase().slice(0, 2);

  if (primary === 'th' || primary === 'ru') {
    return primary;
  }

  return 'en';
}

export function getLocalizedStoryContent(
  content: StoryContent,
  locale: SupportedLocale,
) {
  const fallback = content.en ?? {};
  const localized = content[locale] ?? {};

  const title = localized.title?.trim() || fallback.title?.trim() || '';
  const body = localized.body?.trim() || fallback.body?.trim() || '';

  return { title, body };
}

export function buildExcerpt(body: string, maxLength = 160): string {
  const normalized = body.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength).trimEnd()}…`;
}

export function validateEnglishStoryRequired(content: StoryContent): void {
  const en = content.en;
  if (!en?.title?.trim()) {
    throw new Error('content.en.title is required');
  }
  if (!en?.body?.trim()) {
    throw new Error('content.en.body is required');
  }
}

export { SUPPORTED_LOCALES };
