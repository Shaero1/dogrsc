const DEFAULT_API_BASE = 'http://localhost:4000/api/v1';

function normalizeApiBase(raw: string): string {
  const trimmed = raw.replace(/\/$/, '');

  if (trimmed.endsWith('/api/v1')) {
    return trimmed;
  }

  return `${trimmed}/api/v1`;
}

/**
 * Server (RSC, Server Actions): prefers API_URL for Docker internal networking.
 * Browser: NEXT_PUBLIC_API_URL only.
 */
export function getApiBase(): string {
  if (typeof window === 'undefined') {
    const raw =
      process.env.API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      DEFAULT_API_BASE;
    return normalizeApiBase(raw);
  }

  const raw = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE;
  return normalizeApiBase(raw);
}
