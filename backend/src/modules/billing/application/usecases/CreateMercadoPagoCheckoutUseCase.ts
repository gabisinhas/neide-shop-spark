import { PaymentGateway } from '../../domain/services/PaymentGateway';

export class CreateMercadoPagoCheckoutUseCase {
  constructor(private readonly paymentGateway: PaymentGateway) {}

  execute(params: Parameters<PaymentGateway['createCheckout']>[0]) {
    return this.paymentGateway.createCheckout(params);
  }
}