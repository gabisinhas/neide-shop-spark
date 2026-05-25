import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { OrderRepository } from '../../domain/repositories/OrderRepository';

export class GetOrderByIdUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new ApplicationError('Pedido nao encontrado.', 404);
    }

    return order;
  }
}