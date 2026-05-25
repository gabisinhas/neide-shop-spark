export type ShippingService = 'pac' | 'sedex';

export interface ShippingOption {
  service: ShippingService;
  label: string;
  price: number;
  estimatedDays: number;
}
