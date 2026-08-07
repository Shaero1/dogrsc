export const ALLOWED_MEDIA_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type AllowedMediaMimeType = (typeof ALLOWED_MEDIA_MIME_TYPES)[number];

export const DEFAULT_MEDIA_MAX_BYTES = 5 * 1024 * 1024;

export const DEFAULT_MEDIA_PRESIGNED_TTL_SECONDS = 900;

export const DEFAULT_REPORT_MEDIA_UPLOAD_WINDOW_MINUTES = 15;

export function isAllowedMediaMimeType(
  mimeType: string,
): mimeType is AllowedMediaMimeType {
  return (ALLOWED_MEDIA_MIME_TYPES as readonly string[]).includes(mimeType);
}
