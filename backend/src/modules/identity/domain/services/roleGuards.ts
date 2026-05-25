import { UserRole } from '../entities/User';

export function isAdminRole(role: UserRole) {
  return role === 'admin' || role === 'super_admin';
}

export function isSuperAdminRole(role: UserRole) {
  return role === 'super_admin';
}
