import { getApiBase } from '@/lib/get-api-base';
import { serverFetch } from '@/lib/server-fetch';

export type PublicReportListItem = {
  id: string;
  description: string;
  createdAt: string;
  thumbnailUrl?: string | null;
  hasLocation: boolean;
  verified: boolean;
};

export type PublicReportDetail = {
  id: string;
  reporterName: string;
  reporterPhone: string;
  reporterEmail?: string | null;
  description: string;
  latitude?: string | null;
  longitude?: string | null;
  createdAt: string;
  verified: boolean;
  media: { id: string; url: string; mimeType: string }[];
};

export type PaginatedPublicReports = {
  items: PublicReportListItem[];
  total: number;
  page: number;
  limit: number;
};

export type CreateReportPayload = {
  reporterName: string;
  reporterPhone: string;
  reporterEmail?: string;
  description: string;
  latitude?: number;
  longitude?: number;
  captchaToken: string;
};

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) {
      return body.message.join(', ');
    }
    if (body.message) {
      return body.message;
    }
  } catch {
    // ignore
  }
  return `Request failed (${res.status})`;
}

export async function fetchPublicFoundReports(): Promise<PaginatedPublicReports> {
  const res = await serverFetch(`${getApiBase()}/found-reports?limit=50`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json();
}

export async function fetchPublicLostReports(): Promise<PaginatedPublicReports> {
  const res = await serverFetch(`${getApiBase()}/lost-reports?limit=50`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json();
}

export async function fetchPublicFoundReport(
  id: string,
): Promise<PublicReportDetail | null> {
  const res = await serverFetch(`${getApiBase()}/found-reports/${id}`, {
    cache: 'no-store',
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json();
}

export async function fetchPublicLostReport(
  id: string,
): Promise<PublicReportDetail | null> {
  const res = await serverFetch(`${getApiBase()}/lost-reports/${id}`, {
    cache: 'no-store',
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json();
}

export async function createFoundReport(
  payload: CreateReportPayload,
): Promise<{ id: string }> {
  const res = await serverFetch(`${getApiBase()}/found-reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function createLostReport(
  payload: CreateReportPayload,
): Promise<{ id: string }> {
  const res = await serverFetch(`${getApiBase()}/lost-reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function uploadFoundReportMedia(
  reportId: string,
  file: File,
): Promise<void> {
  const form = new FormData();
  form.append('file', file);

  const res = await serverFetch(`${getApiBase()}/found-reports/${reportId}/media`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }
}

export async function uploadLostReportMedia(
  reportId: string,
  file: File,
): Promise<void> {
  const form = new FormData();
  form.append('file', file);

  const res = await serverFetch(`${getApiBase()}/lost-reports/${reportId}/media`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }
}
