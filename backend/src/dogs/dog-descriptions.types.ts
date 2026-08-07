export type DogLocaleContent = {
  name?: string;
  description?: string;
  rescueStory?: string;
};

export type DogDescriptions = {
  en?: DogLocaleContent;
  th?: DogLocaleContent;
  ru?: DogLocaleContent;
};

export type DogSeoFields = {
  title?: Partial<Record<'en' | 'th' | 'ru', string>>;
  description?: Partial<Record<'en' | 'th' | 'ru', string>>;
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

export function getLocalizedDogContent(
  descriptions: DogDescriptions,
  seo: DogSeoFields,
  locale: SupportedLocale,
) {
  const fallback = descriptions.en ?? {};
  const localized = descriptions[locale] ?? {};

  return {
    name: localized.name ?? fallback.name ?? '',
    description: localized.description ?? fallback.description ?? '',
    rescueStory: localized.rescueStory ?? fallback.rescueStory ?? '',
    seoTitle: seo.title?.[locale] ?? seo.title?.en ?? '',
    seoDescription:
      seo.description?.[locale] ?? seo.description?.en ?? '',
  };
}

export function validateEnglishRequired(descriptions: DogDescriptions): void {
  const en = descriptions.en;
  if (!en?.name?.trim()) {
    throw new Error('descriptions.en.name is required');
  }
  if (!en?.description?.trim()) {
    throw new Error('descriptions.en.description is required');
  }
}

export { SUPPORTED_LOCALES };
