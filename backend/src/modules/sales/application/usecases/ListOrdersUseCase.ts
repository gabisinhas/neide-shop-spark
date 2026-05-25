import { OrderRepository } from '../../domain/repositories/OrderRepository';

export interface ListOrdersInput {
  userId?: string;
}

export class ListOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(input: ListOrdersInput) {
    return input.userId ? this.orderRepository.findByUserId(input.userId) : this.orderRepository.list();
  }
}