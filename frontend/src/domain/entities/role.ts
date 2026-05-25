import { UserRole } from './User';

export function isAdminRole(role?: UserRole | null) {
  return role === 'admin' || role === 'super_admin';
}

export function isSuperAdminRole(role?: UserRole | null) {
  return role === 'super_admin';
}
