import { Product } from '../../../catalog/domain/entities/Product';
import { Address } from '../../../identity/domain/entities/User';

export type OrderStatus = 'pending_payment' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'pix' | 'credit_card' | 'bank_slip';

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  address: Address;
  createdAt: string;
  updatedAt: string;
}