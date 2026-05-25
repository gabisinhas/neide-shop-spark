import { PaymentMethod } from '../../../sales/domain/entities/Order';

export interface PaymentGatewayCheckoutInput {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  customer: {
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface PaymentGatewayCheckout {
  provider: 'mercado_pago';
  checkoutId: string;
  checkoutUrl?: string;
  sandboxCheckoutUrl?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  copyPasteCode?: string;
  expiresAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  raw?: unknown;
}

export interface PaymentGatewayPayment {
  externalReference?: string;
  status: 'pending' | 'approved' | 'rejected';
  raw?: unknown;
}

export interface PaymentGateway {
  createCheckout(input: PaymentGatewayCheckoutInput): Promise<PaymentGatewayCheckout>;
  getPayment(paymentId: string): Promise<PaymentGatewayPayment>;
}