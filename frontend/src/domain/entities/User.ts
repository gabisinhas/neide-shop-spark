import { OrderAddress } from './Order';

export type UserRole = 'customer' | 'admin' | 'super_admin';
export type AuthProvider = 'email' | 'google';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  provider: AuthProvider;
  password?: string;
  address?: OrderAddress;
  createdAt: string;
}
