import { cache } from 'react';
import { getApiBase } from './get-api-base';
import { serverFetch } from './server-fetch';

export type BrandingImage = {
  id: string;
  url: string;
  mimeType: string;
};

export type BrandingPublic = {
  logo: BrandingImage | null;
  heroImage: BrandingImage | null;
};

export async function fetchBranding(): Promise<BrandingPublic | null> {
  const base = getApiBase();

  try {
    const res = await serverFetch(`${base}/content/branding`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as BrandingPublic;
  } catch {
    return null;
  }
}

export const getBranding = cache(fetchBranding);
