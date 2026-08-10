import type {
  CreateDogPayload,
  DogAdmin,
  DogStatus,
  PaginatedDogs,
  UpdateDogPayload,
} from './dogs-types';
import type {
  PaginatedReports,
  ReportDetail,
  ReportListParams,
  UpdateReportStatusPayload,
} from './reports-types';
import type {
  CreateCryptoAddressPayload,
  CryptoAddressAdmin,
  CryptoAddressesAdminResponse,
  UpdateCryptoAddressPayload,
} from './crypto-types';
import type {
  CreateStoryPayload,
  PaginatedStories,
  StoryAdmin,
  UpdateStoryPayload,
} from './stories-types';
import type { DashboardStats } from './dashboard-types';
import type {
  CreateDonationAdminPayload,
  DonationRecord,
  DonationsListResponse,
  DonationStatus,
  UpdateDonationStatusPayload,
} from './donations-types';
import type {
  CreateUserAdminPayload,
  UpdateUserAdminPayload,
  AdminUserRecord,
  AdminUserRole,
  UsersListResponse,
} from './users-types';
import type {
  ContentItem,
  ContentPageSummary,
  PageContentAdmin,
} from './content-types';

function getApiV1Base(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const trimmed = raw.replace(/\/$/, '');

  if (trimmed.endsWith('/api/v1')) {
    return trimmed;
  }

  return `${trimmed}/api/v1`;
}

const API_URL = getApiV1Base();

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
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
    // ignore JSON parse errors
  }
  return `Request failed (${res.status})`;
}

async function authFetch(
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  if (init.body && !(init.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...headers,
      ...(init.headers as Record<string, string> | undefined),
    },
  });
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function fetchMe(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function listDogs(
  token: string,
  params?: {
    page?: number;
    limit?: number;
    status?: DogStatus;
    isPublished?: boolean;
    excludeArchived?: boolean;
    search?: string;
  },
): Promise<PaginatedDogs> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.status) query.set('status', params.status);
  if (params?.isPublished !== undefined) {
    query.set('isPublished', String(params.isPublished));
  }
  if (params?.excludeArchived) query.set('excludeArchived', 'true');
  if (params?.search?.trim()) query.set('search', params.search.trim());

  const res = await authFetch(
    token,
    `/admin/dogs${query.size ? `?${query}` : ''}`,
  );

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function getDog(token: string, id: string): Promise<DogAdmin> {
  const res = await authFetch(token, `/admin/dogs/${id}`);

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function createDog(
  token: string,
  payload: CreateDogPayload,
): Promise<DogAdmin> {
  const res = await authFetch(token, '/admin/dogs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function updateDog(
  token: string,
  id: string,
  payload: UpdateDogPayload,
): Promise<DogAdmin> {
  const res = await authFetch(token, `/admin/dogs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function archiveDog(token: string, id: string): Promise<DogAdmin> {
  const res = await authFetch(token, `/admin/dogs/${id}/archive`, {
    method: 'POST',
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function uploadDogMedia(
  token: string,
  dogId: string,
  file: File,
): Promise<{ id: string; url: string; mimeType: string }> {
  const form = new FormData();
  form.append('file', file);
  form.append('entityType', 'dog');
  form.append('entityId', dogId);

  const res = await authFetch(token, '/admin/media', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function deleteMedia(token: string, mediaId: string): Promise<void> {
  const res = await authFetch(token, `/admin/media/${mediaId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }
}

function buildReportQuery(params?: ReportListParams): string {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.status) query.set('status', params.status);
  return query.size ? `?${query}` : '';
}

export async function listFoundReports(
  token: string,
  params?: ReportListParams,
): Promise<PaginatedReports> {
  const res = await authFetch(
    token,
    `/admin/found-reports${buildReportQuery(params)}`,
  );

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function listLostReports(
  token: string,
  params?: ReportListParams,
): Promise<PaginatedReports> {
  const res = await authFetch(
    token,
    `/admin/lost-reports${buildReportQuery(params)}`,
  );

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function getFoundReport(
  token: string,
  id: string,
): Promise<ReportDetail> {
  const res = await authFetch(token, `/admin/found-reports/${id}`);

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function getLostReport(
  token: string,
  id: string,
): Promise<ReportDetail> {
  const res = await authFetch(token, `/admin/lost-reports/${id}`);

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function updateFoundReportStatus(
  token: string,
  id: string,
  payload: UpdateReportStatusPayload,
): Promise<ReportDetail> {
  const res = await authFetch(token, `/admin/found-reports/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function updateLostReportStatus(
  token: string,
  id: string,
  payload: UpdateReportStatusPayload,
): Promise<ReportDetail> {
  const res = await authFetch(token, `/admin/lost-reports/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function listCryptoAddresses(
  token: string,
): Promise<CryptoAddressesAdminResponse> {
  const res = await authFetch(token, '/admin/crypto-addresses');

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function createCryptoAddress(
  token: string,
  payload: CreateCryptoAddressPayload,
): Promise<CryptoAddressAdmin> {
  const res = await authFetch(token, '/admin/crypto-addresses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function updateCryptoAddress(
  token: string,
  id: string,
  payload: UpdateCryptoAddressPayload,
): Promise<CryptoAddressAdmin> {
  const res = await authFetch(token, `/admin/crypto-addresses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function getBankDetails(token: string): Promise<PageContentAdmin> {
  const res = await authFetch(token, '/admin/donations/bank-details');

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function updateBankDetails(
  token: string,
  items: ContentItem[],
): Promise<PageContentAdmin> {
  const res = await authFetch(token, '/admin/donations/bank-details', {
    method: 'PUT',
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function listDonations(
  token: string,
  params?: { status?: DonationStatus; page?: number; limit?: number },
): Promise<DonationsListResponse> {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (params?.page) search.set('page', String(params.page));
  if (params?.limit) search.set('limit', String(params.limit));

  const query = search.toString();
  const path = query ? `/admin/donations?${query}` : '/admin/donations';
  const res = await authFetch(token, path);

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function createDonationAdmin(
  token: string,
  payload: CreateDonationAdminPayload,
): Promise<DonationRecord> {
  const res = await authFetch(token, '/admin/donations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function updateDonationStatus(
  token: string,
  id: string,
  payload: UpdateDonationStatusPayload,
): Promise<DonationRecord> {
  const res = await authFetch(token, `/admin/donations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function listUsers(
  token: string,
  params?: { role?: AdminUserRole; page?: number; limit?: number },
): Promise<UsersListResponse> {
  const search = new URLSearchParams();
  if (params?.role) search.set('role', params.role);
  if (params?.page) search.set('page', String(params.page));
  if (params?.limit) search.set('limit', String(params.limit));

  const query = search.toString();
  const path = query ? `/admin/users?${query}` : '/admin/users';
  const res = await authFetch(token, path);

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function createUser(
  token: string,
  payload: CreateUserAdminPayload,
): Promise<AdminUserRecord> {
  const res = await authFetch(token, '/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function updateUser(
  token: string,
  id: string,
  payload: UpdateUserAdminPayload,
): Promise<AdminUserRecord> {
  const res = await authFetch(token, `/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function fetchDashboardStats(
  token: string,
): Promise<DashboardStats> {
  const res = await authFetch(token, '/admin/dashboard/stats');

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function listContentPages(
  token: string,
): Promise<ContentPageSummary[]> {
  const res = await authFetch(token, '/admin/content/pages');

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function getContentPage(
  token: string,
  entityId: string,
): Promise<PageContentAdmin> {
  const res = await authFetch(token, `/admin/content/pages/${entityId}`);

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function updateContentPage(
  token: string,
  entityId: string,
  items: ContentItem[],
): Promise<PageContentAdmin> {
  const res = await authFetch(token, `/admin/content/pages/${entityId}`, {
    method: 'PUT',
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function listStories(
  token: string,
  params?: {
    page?: number;
    limit?: number;
    isPublished?: boolean;
  },
): Promise<PaginatedStories> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.isPublished !== undefined) {
    query.set('isPublished', String(params.isPublished));
  }

  const res = await authFetch(
    token,
    `/admin/stories${query.size ? `?${query}` : ''}`,
  );

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function getStory(token: string, id: string): Promise<StoryAdmin> {
  const res = await authFetch(token, `/admin/stories/${id}`);

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function createStory(
  token: string,
  payload: CreateStoryPayload,
): Promise<StoryAdmin> {
  const res = await authFetch(token, '/admin/stories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function updateStory(
  token: string,
  id: string,
  payload: UpdateStoryPayload,
): Promise<StoryAdmin> {
  const res = await authFetch(token, `/admin/stories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}

export async function deleteStory(token: string, id: string): Promise<void> {
  const res = await authFetch(token, `/admin/stories/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }
}

export async function uploadStoryMedia(
  token: string,
  storyId: string,
  file: File,
): Promise<{ id: string; url: string; mimeType: string }> {
  const form = new FormData();
  form.append('file', file);
  form.append('entityType', 'story');
  form.append('entityId', storyId);

  const res = await authFetch(token, '/admin/media', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
}
