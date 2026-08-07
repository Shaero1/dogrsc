export type DogLocaleContent = {
  name?: string;
  description?: string;
  rescueStory?: string;
};

export type DogDescriptions = {
  en: DogLocaleContent;
  th?: DogLocaleContent;
  ru?: DogLocaleContent;
};

export type DogSeo = {
  title?: Partial<Record<'en' | 'th' | 'ru', string>>;
  description?: Partial<Record<'en' | 'th' | 'ru', string>>;
};

export type DogStatus =
  | 'AVAILABLE'
  | 'ADOPTED'
  | 'IN_CARE'
  | 'ARCHIVED';

export type MediaItem = {
  id: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  createdAt: string;
};

export type DogAdmin = {
  id: string;
  slug: string;
  status: DogStatus;
  isPublished: boolean;
  descriptions: DogDescriptions;
  seo: DogSeo;
  media: MediaItem[];
  createdAt: string;
  updatedAt: string;
};

export type DogListItem = {
  id: string;
  slug: string;
  status: DogStatus;
  isPublished: boolean;
  nameEn?: string;
  updatedAt: string;
};

export type PaginatedDogs = {
  items: DogListItem[];
  total: number;
  page: number;
  limit: number;
};

export type CreateDogPayload = {
  descriptions: DogDescriptions;
  seo?: DogSeo;
  slug?: string;
  status?: DogStatus;
  isPublished?: boolean;
};

export type UpdateDogPayload = Partial<CreateDogPayload>;

export const DOG_STATUSES: DogStatus[] = [
  'AVAILABLE',
  'IN_CARE',
  'ADOPTED',
  'ARCHIVED',
];

export const emptyDescriptions = (): DogDescriptions => ({
  en: { name: '', description: '', rescueStory: '' },
  th: { name: '', description: '', rescueStory: '' },
  ru: { name: '', description: '', rescueStory: '' },
});

function trimOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function sanitizeLocale(
  locale: DogLocaleContent,
): DogLocaleContent | undefined {
  const name = trimOptional(locale.name);
  const description = trimOptional(locale.description);
  const rescueStory = trimOptional(locale.rescueStory);

  if (!name && !description && !rescueStory) {
    return undefined;
  }

  return {
    ...(name ? { name } : {}),
    ...(description ? { description } : {}),
    ...(rescueStory ? { rescueStory } : {}),
  };
}

/** Strip empty th/ru blocks before API submit (matches backend optional locales). */
export function sanitizeDescriptions(
  descriptions: DogDescriptions,
): DogDescriptions {
  const en: DogLocaleContent = {
    name: descriptions.en.name?.trim() ?? '',
    description: descriptions.en.description?.trim() ?? '',
  };
  const rescueStory = trimOptional(descriptions.en.rescueStory);
  if (rescueStory) {
    en.rescueStory = rescueStory;
  }

  const result: DogDescriptions = { en };

  for (const locale of ['th', 'ru'] as const) {
    const stripped = sanitizeLocale(descriptions[locale] ?? {});
    if (stripped) {
      result[locale] = stripped;
    } else {
      result[locale] = {};
    }
  }

  return result;
}

export const emptySeo = (): DogSeo => ({
  title: { en: '', th: '', ru: '' },
  description: { en: '', th: '', ru: '' },
});
