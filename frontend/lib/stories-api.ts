import type { Locale } from '@/i18n/routing';
import { getApiBase } from '@/lib/get-api-base';
import { serverFetch } from '@/lib/server-fetch';

export type StoryMedia = {
  id: string;
  url: string;
  mimeType: string;
};

export type StoryListItem = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  cover: StoryMedia | null;
  dogSlug: string | null;
  locale: string;
};

export type StoryDetail = StoryListItem & {
  body: string;
};

export type StoryListResponse = {
  items: StoryListItem[];
  total: number;
  page: number;
  limit: number;
};

export async function fetchPublicStories(
  locale: Locale,
  page = 1,
  limit = 20,
): Promise<StoryListResponse> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const res = await serverFetch(`${getApiBase()}/stories?${query}`, {
    headers: { 'Accept-Language': locale },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch stories: ${res.status}`);
  }

  return res.json();
}

export async function fetchPublicStoryBySlug(
  locale: Locale,
  slug: string,
): Promise<StoryDetail | null> {
  const res = await serverFetch(
    `${getApiBase()}/stories/${encodeURIComponent(slug)}`,
    {
      headers: { 'Accept-Language': locale },
      cache: 'no-store',
    },
  );

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch story: ${res.status}`);
  }

  return res.json();
}
