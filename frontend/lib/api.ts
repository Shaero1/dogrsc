import type { Locale } from '@/i18n/routing';
import { getApiBase } from '@/lib/get-api-base';
import { serverFetch } from '@/lib/server-fetch';

export type PublicDogMedia = {
  id: string;
  url: string;
  mimeType: string;
};

export type PublicDog = {
  slug: string;
  status: 'AVAILABLE' | 'IN_CARE' | 'ADOPTED' | 'ARCHIVED';
  name: string;
  description: string;
  rescueStory?: string;
  seoTitle?: string;
  seoDescription?: string;
  media: PublicDogMedia[];
  locale: string;
};

export type PublicDogList = {
  items: PublicDog[];
  total: number;
  page: number;
  limit: number;
};

export async function fetchPublicDogs(
  locale: Locale,
  page = 1,
  limit = 20,
): Promise<PublicDogList> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const res = await serverFetch(`${getApiBase()}/dogs?${query}`, {
    headers: { 'Accept-Language': locale },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch dogs: ${res.status}`);
  }

  return res.json();
}

export async function fetchPublicDogBySlug(
  locale: Locale,
  slug: string,
): Promise<PublicDog | null> {
  const res = await serverFetch(`${getApiBase()}/dogs/${encodeURIComponent(slug)}`, {
    headers: { 'Accept-Language': locale },
    next: { revalidate: 60 },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch dog: ${res.status}`);
  }

  return res.json();
}
