import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { Order, OrderStatus } from '../../domain/entities/Order';
import { OrderRepository } from '../../domain/repositories/OrderRepository';

export class UpdateOrderStatusUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.updateStatus(orderId, status);

    if (!order) {
      throw new ApplicationError('Pedido nao encontrado.', 404);
    }

    return order;
  }
}