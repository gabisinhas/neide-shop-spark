import { randomUUID } from 'node:crypto';
import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { Address } from '../../../identity/domain/entities/User';
import { UserRepository } from '../../../identity/domain/repositories/UserRepository';
import { Order, OrderItem, PaymentMethod } from '../../domain/entities/Order';
import { OrderRepository } from '../../domain/repositories/OrderRepository';
import { CalculateShippingUseCase } from '../../../shipping/application/usecases/CalculateShippingUseCase';
import { ShippingService } from '../../../shipping/domain/entities/ShippingOption';

export interface CreateOrderInput {
  userId: string;
  items: OrderItem[];
  paymentMethod: PaymentMethod;
  address: Address;
  shippingService: ShippingService;
}

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly userRepository: UserRepository,
    private readonly calculateShipping: CalculateShippingUseCase,
  ) {}

  async execute(input: CreateOrderInput) {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new ApplicationError('Usuario nao encontrado para criar o pedido.', 404);
    }

    if (!input.items.length) {
      throw new ApplicationError('O pedido precisa ter pelo menos um item.', 400);
    }

    const subtotal = input.items.reduce((total, item) => total + (item.product.salePrice ?? item.product.price) * item.quantity, 0);
    const shippingOptions = this.calculateShipping.execute({
      address: input.address,
      items: input.items,
    });
    const selectedShipping = shippingOptions.find((option) => option.service === input.shippingService);

    if (!selectedShipping) {
      throw new ApplicationError('Servico de frete invalido para este pedido.', 400, 'INVALID_SHIPPING_SERVICE');
    }

    const shippingFee = selectedShipping.price;
    const now = new Date().toISOString();

    const order: Order = {
      id: `PED-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 900 + 100)}`,
      userId: user.id || randomUUID(),
      userName: user.name,
      userEmail: user.email,
      items: input.items,
      status: 'pending_payment',
      subtotal,
      shippingFee,
      total: subtotal + shippingFee,
      paymentMethod: input.paymentMethod,
      address: input.address,
      createdAt: now,
      updatedAt: now,
    };

    return this.orderRepository.create(order);
  }
}
