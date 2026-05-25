import { ICartRepository } from '../../../domain/repositories/ICartRepository';

export class ClearCartUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(): Promise<void> {
    await this.cartRepository.saveCart([]);
  }
}
