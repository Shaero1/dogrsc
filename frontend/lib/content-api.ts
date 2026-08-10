import { getApiBase } from './get-api-base';
import { serverFetch } from './server-fetch';

export type PageContentFields = Record<string, string>;

export type PageContentResponse = {
  entityId: string;
  locale: string;
  fields: PageContentFields;
};

export async function fetchPageContent(
  entityId: string,
  locale: string,
): Promise<PageContentFields | null> {
  const base = getApiBase();
  const url = `${base}/content/pages/${encodeURIComponent(entityId)}?locale=${encodeURIComponent(locale)}`;

  try {
    const res = await serverFetch(url, { next: { revalidate: 0 } });
    if (!res.ok) {
      return null;
    }

    const body = (await res.json()) as PageContentResponse;
    return body.fields ?? null;
  } catch {
    return null;
  }
}
