import { CartItem } from './CartItem';

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderAddress {
  recipient: string;
  phone: string;
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: CartItem[];
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: 'pix' | 'credit_card' | 'bank_slip';
  address: OrderAddress;
  createdAt: string;
  updatedAt: string;
}
