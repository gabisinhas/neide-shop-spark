import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { OrderStatus } from '../../../sales/domain/entities/Order';
import { OrderRepository } from '../../../sales/domain/repositories/OrderRepository';
import { PaymentGateway } from '../../domain/services/PaymentGateway';

export interface MercadoPagoWebhookInput {
  paymentId?: string;
}

export class HandleMercadoPagoWebhookUseCase {
  constructor(
    private readonly paymentGateway: PaymentGateway,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(input: MercadoPagoWebhookInput) {
    if (!input.paymentId) {
      return { acknowledged: true, ignored: true };
    }

    const payment = await this.paymentGateway.getPayment(input.paymentId);

    if (!payment.externalReference) {
      throw new ApplicationError('Pagamento sem referencia de pedido no Mercado Pago.', 400);
    }

    const nextStatus: OrderStatus = mapPaymentStatusToOrderStatus(payment.status);
    if (nextStatus === 'paid') {
      await this.orderRepository.markAsPaid(payment.externalReference);
    } else {
      await this.orderRepository.updateStatus(payment.externalReference, nextStatus);
    }

    return {
      acknowledged: true,
      ignored: false,
      orderId: payment.externalReference,
      status: nextStatus,
    };
  }
}

function mapPaymentStatusToOrderStatus(status: 'pending' | 'approved' | 'rejected'): OrderStatus {
  switch (status) {
    case 'approved':
      return 'paid';
    case 'rejected':
      return 'cancelled';
    default:
      return 'pending_payment';
  }
}