import type { AdminUserRole } from './users-types';

export type AdminNavItem = {
  label: string;
  href: string;
  roles: AdminUserRole[];
};

export const adminNavItems: AdminNavItem[] = [
  { label: 'Dashboard', href: '/dashboard', roles: ['ADMIN', 'STAFF'] },
  { label: 'Dogs', href: '/dogs', roles: ['ADMIN', 'STAFF'] },
  { label: 'Stories', href: '/stories', roles: ['ADMIN', 'STAFF'] },
  { label: 'Reports', href: '/reports', roles: ['ADMIN', 'STAFF'] },
  { label: 'Donations', href: '/donations', roles: ['ADMIN', 'STAFF'] },
  { label: 'Content', href: '/content', roles: ['ADMIN'] },
  { label: 'Users', href: '/users', roles: ['ADMIN'] },
];

export function navItemsForRole(role: AdminUserRole): AdminNavItem[] {
  return adminNavItems.filter((item) => item.roles.includes(role));
}
