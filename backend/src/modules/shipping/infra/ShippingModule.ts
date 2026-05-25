import { CalculateShippingUseCase } from '../application/usecases/CalculateShippingUseCase';

export class ShippingModule {
  readonly calculateShipping: CalculateShippingUseCase;

  constructor() {
    this.calculateShipping = new CalculateShippingUseCase();
  }
}
