export type UserRole = 'customer' | 'admin' | 'super_admin';
export type AuthProvider = 'email' | 'google';

export interface Address {
  recipient: string;
  phone: string;
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  provider: AuthProvider;
  passwordHash?: string;
  address?: Address;
  createdAt: string;
  deletedAt?: string;
}

export type PublicUser = Omit<User, 'passwordHash' | 'deletedAt'>;
