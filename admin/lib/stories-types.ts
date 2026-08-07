export type StoryLocaleContent = {
  title: string;
  body: string;
};

export type StoryContent = {
  en: StoryLocaleContent;
  th?: StoryLocaleContent;
  ru?: StoryLocaleContent;
};

export type StoryMedia = {
  id: string;
  url: string;
  mimeType: string;
};

export type StoryAdmin = {
  id: string;
  slug: string;
  isPublished: boolean;
  publishedAt: string | null;
  dogId: string | null;
  dogSlug: string | null;
  content: StoryContent;
  media: StoryMedia[];
  createdAt: string;
  updatedAt: string;
};

export type StoryListItem = {
  id: string;
  slug: string;
  title: string;
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

export type PaginatedStories = {
  items: StoryListItem[];
  total: number;
  page: number;
  limit: number;
};

export type CreateStoryPayload = {
  slug?: string;
  content: StoryContent;
  isPublished?: boolean;
  dogId?: string | null;
};

export type UpdateStoryPayload = Partial<CreateStoryPayload>;

export function emptyStoryContent(): StoryContent {
  return {
    en: { title: '', body: '' },
    th: { title: '', body: '' },
    ru: { title: '', body: '' },
  };
}

export function sanitizeStoryContent(content: StoryContent): StoryContent {
  const locales = ['en', 'th', 'ru'] as const;
  const next = { ...content } as StoryContent;

  for (const locale of locales) {
    const entry = next[locale];
    if (!entry) continue;
    const title = entry.title.trim();
    const body = entry.body.trim();
    if (!title && !body) {
      delete next[locale];
      continue;
    }
    next[locale] = { title, body };
  }

  return next;
}
