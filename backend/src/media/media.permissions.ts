import { UserRole } from '@prisma/client';

export type MediaPermissionUser = {
  id: string;
  role: UserRole;
};

export type MediaPermissionRecord = {
  uploadedById: string;
  entityType: string | null;
  entityId: string | null;
};

export function canDeleteMedia(
  user: MediaPermissionUser,
  media: MediaPermissionRecord,
): boolean {
  if (user.role === UserRole.ADMIN) {
    return true;
  }

  if (user.role !== UserRole.STAFF) {
    return false;
  }

  if (media.uploadedById === user.id) {
    return true;
  }

  return Boolean(media.entityType && media.entityId);
}
