export type AdminUserRole = 'ADMIN' | 'STAFF';

export type AdminUserRecord = {
  id: string;
  email: string;
  role: AdminUserRole;
  createdAt: string;
  updatedAt: string;
};

export type UsersListResponse = {
  items: AdminUserRecord[];
  total: number;
  page: number;
  limit: number;
};

export type CreateUserAdminPayload = {
  email: string;
  password: string;
  role: AdminUserRole;
};

export type UpdateUserAdminPayload = {
  role?: AdminUserRole;
  password?: string;
};

export const ADMIN_USER_ROLES: AdminUserRole[] = ['ADMIN', 'STAFF'];
