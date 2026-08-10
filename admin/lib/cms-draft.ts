import {
  CONTENT_LOCALES,
  type ContentItem,
  type ContentLocale,
} from './content-types';

export function buildDraftMap(
  fields: string[],
  items: ContentItem[],
): Record<ContentLocale, Record<string, string>> {
  const draft: Record<ContentLocale, Record<string, string>> = {
    en: {},
    th: {},
    ru: {},
  };

  for (const locale of CONTENT_LOCALES) {
    for (const field of fields) {
      const match = items.find(
        (item) => item.locale === locale && item.field === field,
      );
      draft[locale][field] = match?.value ?? '';
    }
  }

  return draft;
}

export function draftToContentItems(
  fields: string[],
  draft: Record<ContentLocale, Record<string, string>>,
): ContentItem[] {
  const items: ContentItem[] = [];

  for (const locale of CONTENT_LOCALES) {
    for (const field of fields) {
      items.push({
        locale,
        field,
        value: draft[locale][field] ?? '',
      });
    }
  }

  return items;
}
