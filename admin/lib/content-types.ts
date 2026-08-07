export type ContentLocale = 'en' | 'th' | 'ru';

export type ContentPageSummary = {
  id: string;
  label: string;
  fields: string[];
};

export type ContentItem = {
  locale: ContentLocale;
  field: string;
  value: string;
};

export type PageContentAdmin = {
  entityId: string;
  items: ContentItem[];
};

export type PageContentPublic = {
  entityId: string;
  locale: string;
  fields: Record<string, string>;
};

export const CONTENT_LOCALES: ContentLocale[] = ['en', 'th', 'ru'];

export const CONTENT_LOCALE_LABELS: Record<ContentLocale, string> = {
  en: 'English',
  th: 'Thai',
  ru: 'Russian',
};
