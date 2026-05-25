import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { Address } from '../../../identity/domain/entities/User';
import { OrderItem } from '../../../sales/domain/entities/Order';
import { ShippingOption, ShippingService } from '../../domain/entities/ShippingOption';

type CalculateShippingInput = {
  address: Address;
  items: OrderItem[];
};

const SOUTHEAST_STATES = new Set(['SP', 'RJ', 'MG', 'ES']);

function normalizeZipCode(zipCode: string) {
  return zipCode.replace(/\D/g, '');
}

function normalizeState(state: string) {
  return state.trim().toUpperCase();
}

function resolveRegionMultiplier(state: string) {
  if (state === 'SP') return 0;
  if (SOUTHEAST_STATES.has(state)) return 1;
  return 2;
}

function resolveBasePrice(service: ShippingService, regionMultiplier: number) {
  const baseMatrix = {
    pac: [12.9, 16.9, 22.9],
    sedex: [21.9, 27.9, 34.9],
  } as const;

  return baseMatrix[service][regionMultiplier];
}

function resolveEstimatedDays(service: ShippingService, regionMultiplier: number) {
  const daysMatrix = {
    pac: [3, 5, 8],
    sedex: [1, 2, 4],
  } as const;

  return daysMatrix[service][regionMultiplier];
}

export class CalculateShippingUseCase {
  execute({ address, items }: CalculateShippingInput): ShippingOption[] {
    const zipCode = normalizeZipCode(address.zipCode);
    const state = normalizeState(address.state);

    if (zipCode.length !== 8) {
      throw new ApplicationError('Informe um CEP valido para calcular o frete.', 400, 'INVALID_ZIP_CODE');
    }

    if (!state) {
      throw new ApplicationError('Informe o estado de entrega para calcular o frete.', 400, 'INVALID_STATE');
    }

    if (!items.length) {
      throw new ApplicationError('Adicione itens ao carrinho antes de calcular o frete.', 400, 'EMPTY_CART');
    }

    const subtotal = items.reduce((total, item) => total + (item.product.salePrice ?? item.product.price) * item.quantity, 0);
    const quantity = items.reduce((total, item) => total + item.quantity, 0);
    const regionMultiplier = resolveRegionMultiplier(state);
    const volumeSurcharge = Math.max(0, quantity - 1) * 2.5;

    return (['pac', 'sedex'] as ShippingService[]).map((service) => {
      const basePrice = resolveBasePrice(service, regionMultiplier);
      const promotionalDiscount = subtotal >= 250 && service === 'pac' ? basePrice + volumeSurcharge : 0;
      const price = Math.max(0, Number((basePrice + volumeSurcharge - promotionalDiscount).toFixed(2)));

      return {
        service,
        label: service.toUpperCase(),
        price,
        estimatedDays: resolveEstimatedDays(service, regionMultiplier),
      };
    });
  }
}
