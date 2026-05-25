import { Order } from '../entities/Order';

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  list(): Promise<Order[]>;
  create(order: Order): Promise<Order>;
  updateStatus(orderId: string, status: Order['status']): Promise<Order | null>;
}