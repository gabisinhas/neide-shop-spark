import { CreateMercadoPagoCheckoutUseCase } from '../application/usecases/CreateMercadoPagoCheckoutUseCase';
import { HandleMercadoPagoWebhookUseCase } from '../application/usecases/HandleMercadoPagoWebhookUseCase';
import { PaymentGatewayCheckout } from '../domain/services/PaymentGateway';
import { MercadoPagoGateway } from './mercadoPago/MercadoPagoGateway';
import { OrderRepository } from '../../sales/domain/repositories/OrderRepository';
import { ApplicationError } from '../../../shared/application/ApplicationError';

class CreateMercadoPagoOrderCheckoutUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly createMercadoPagoCheckoutUseCase: CreateMercadoPagoCheckoutUseCase,
  ) {}

  async execute(orderId: string): Promise<PaymentGatewayCheckout> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new ApplicationError('Pedido nao encontrado para iniciar checkout.', 404);
    }

    return this.createMercadoPagoCheckoutUseCase.execute({
      orderId: order.id,
      amount: order.total,
      method: order.paymentMethod,
      customer: {
        name: order.userName,
        email: order.userEmail,
      },
      items: order.items.map((item) => ({
        id: item.product.id,
        title: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
      })),
    });
  }
}

export class BillingModule {
  readonly createMercadoPagoCheckout: CreateMercadoPagoOrderCheckoutUseCase;
  readonly handleMercadoPagoWebhook: HandleMercadoPagoWebhookUseCase;

  constructor(mercadoPagoGateway: MercadoPagoGateway, orderRepository: OrderRepository) {
    this.createMercadoPagoCheckout = new CreateMercadoPagoOrderCheckoutUseCase(
      orderRepository,
      new CreateMercadoPagoCheckoutUseCase(mercadoPagoGateway),
    );
    this.handleMercadoPagoWebhook = new HandleMercadoPagoWebhookUseCase(mercadoPagoGateway, orderRepository);
  }
}