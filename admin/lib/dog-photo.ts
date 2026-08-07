export const MAX_DOG_PHOTO_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

const EXTENSION_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function resolvePhotoMime(file: File): string | null {
  if (ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return file.type;
  }

  const match = file.name.toLowerCase().match(/(\.[^.]+)$/);
  if (!match) return null;

  return EXTENSION_TO_MIME[match[1]] ?? null;
}

/** Returns an error message, or null if the file is valid. */
export function validateDogPhotoFile(file: File): string | null {
  if (!resolvePhotoMime(file)) {
    return `${file.name}: only JPEG, PNG, or WebP images are allowed.`;
  }

  if (file.size > MAX_DOG_PHOTO_BYTES) {
    return `${file.name}: must be 5 MB or smaller.`;
  }

  return null;
}
