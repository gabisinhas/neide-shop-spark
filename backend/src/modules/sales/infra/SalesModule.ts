import { Pool } from 'pg';
import { UserRepository } from '../../identity/domain/repositories/UserRepository';
import { CreateOrderUseCase } from '../application/usecases/CreateOrderUseCase';
import { GetOrderByIdUseCase } from '../application/usecases/GetOrderByIdUseCase';
import { ListOrdersUseCase } from '../application/usecases/ListOrdersUseCase';
import { UpdateOrderStatusUseCase } from '../application/usecases/UpdateOrderStatusUseCase';
import { PostgresOrderRepository } from './persistence/PostgresOrderRepository';
import { CalculateShippingUseCase } from '../../shipping/application/usecases/CalculateShippingUseCase';

export class SalesModule {
  readonly orderRepository: PostgresOrderRepository;
  readonly createOrder: CreateOrderUseCase;
  readonly getOrderById: GetOrderByIdUseCase;
  readonly listOrders: ListOrdersUseCase;
  readonly updateOrderStatus: UpdateOrderStatusUseCase;

  constructor(pool: Pool, userRepository: UserRepository, calculateShipping: CalculateShippingUseCase) {
    this.orderRepository = new PostgresOrderRepository(pool);
    this.createOrder = new CreateOrderUseCase(this.orderRepository, userRepository, calculateShipping);
    this.getOrderById = new GetOrderByIdUseCase(this.orderRepository);
    this.listOrders = new ListOrdersUseCase(this.orderRepository);
    this.updateOrderStatus = new UpdateOrderStatusUseCase(this.orderRepository);
  }
}
