import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { logger } from '../../../../shared/infra/observability/logger';
import {
  PaymentGateway,
  PaymentGatewayCheckout,
  PaymentGatewayCheckoutInput,
  PaymentGatewayPayment,
} from '../../domain/services/PaymentGateway';

type MercadoPagoPreferenceResponse = {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
  date_of_expiration?: string;
};

type MercadoPagoPaymentResponse = {
  external_reference?: string;
  status?: string;
};

export class MercadoPagoGateway implements PaymentGateway {
  constructor(
    private readonly accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN,
    private readonly publicBaseUrl = process.env.APP_BASE_URL,
  ) {}

  async createCheckout(input: PaymentGatewayCheckoutInput): Promise<PaymentGatewayCheckout> {
    const accessToken = this.requireAccessToken();

    try {
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          external_reference: input.orderId,
          statement_descriptor: 'NSCLOSET',
          notification_url: this.publicBaseUrl
            ? `${this.publicBaseUrl.replace(/\/$/, '')}/api/payments/mercado-pago/webhook`
            : undefined,
          back_urls: this.publicBaseUrl
            ? {
                success: `${this.publicBaseUrl.replace(/\/$/, '')}/checkout/success`,
                pending: `${this.publicBaseUrl.replace(/\/$/, '')}/checkout/pending`,
                failure: `${this.publicBaseUrl.replace(/\/$/, '')}/checkout/failure`,
              }
            : undefined,
          auto_return: 'approved',
          payer: {
            name: input.customer.name,
            email: input.customer.email,
          },
          items: input.items.map((item) => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            currency_id: 'BRL',
            unit_price: Number(item.unitPrice.toFixed(2)),
          })),
          metadata: {
            requested_method: input.method,
          },
        }),
      });

      const payload = (await response.json().catch(() => null)) as MercadoPagoPreferenceResponse | null;

      if (!response.ok || !payload?.id) {
        throw new ApplicationError('Falha ao criar checkout no Mercado Pago.', 502, 'MERCADO_PAGO_CHECKOUT_FAILED', payload);
      }

      return {
        provider: 'mercado_pago',
        checkoutId: payload.id,
        checkoutUrl: payload.init_point,
        sandboxCheckoutUrl: payload.sandbox_init_point,
        expiresAt: payload.date_of_expiration,
        status: 'pending',
        raw: payload,
      };
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }

      logger.error({
        message: 'Mercado Pago checkout communication failed.',
        route: 'mercado-pago-checkout',
        code: 'MERCADO_PAGO_COMMUNICATION_FAILED',
        orderId: input.orderId,
        error,
      });
      throw new ApplicationError('Falha ao comunicar com o Mercado Pago.', 502, 'MERCADO_PAGO_COMMUNICATION_FAILED');
    }
  }

  async getPayment(paymentId: string): Promise<PaymentGatewayPayment> {
    const accessToken = this.requireAccessToken();

    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const payload = (await response.json().catch(() => null)) as MercadoPagoPaymentResponse | null;

      if (!response.ok) {
        throw new ApplicationError('Falha ao consultar pagamento no Mercado Pago.', 502, 'MERCADO_PAGO_PAYMENT_QUERY_FAILED', payload);
      }

      return {
        externalReference: payload?.external_reference,
        status: mapMercadoPagoStatus(payload?.status),
        raw: payload,
      };
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }

      logger.error({
        message: 'Mercado Pago payment query failed.',
        route: 'mercado-pago-payment',
        code: 'MERCADO_PAGO_COMMUNICATION_FAILED',
        paymentId,
        error,
      });
      throw new ApplicationError('Falha ao consultar pagamento no Mercado Pago.', 502, 'MERCADO_PAGO_COMMUNICATION_FAILED');
    }
  }

  private requireAccessToken() {
    if (!this.accessToken) {
      throw new ApplicationError('MERCADO_PAGO_ACCESS_TOKEN nao configurado.', 500, 'MERCADO_PAGO_TOKEN_MISSING');
    }

    return this.accessToken;
  }
}

function mapMercadoPagoStatus(status?: string): PaymentGatewayPayment['status'] {
  switch (status) {
    case 'approved':
      return 'approved';
    case 'rejected':
    case 'cancelled':
      return 'rejected';
    default:
      return 'pending';
  }
}
