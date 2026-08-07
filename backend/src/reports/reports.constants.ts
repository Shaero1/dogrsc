export const ENTITY_TYPE_DOG = 'dog';
export const ENTITY_TYPE_FOUND_REPORT = 'found_report';
export const ENTITY_TYPE_LOST_REPORT = 'lost_report';

export const REPORT_ENTITY_TYPES = [
  ENTITY_TYPE_FOUND_REPORT,
  ENTITY_TYPE_LOST_REPORT,
] as const;

export const DEFAULT_REPORT_MEDIA_UPLOAD_WINDOW_MINUTES = 15;

export const SYSTEM_USER_EMAIL = 'system@dogerescue.org';
