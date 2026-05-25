import { ICartRepository } from '../../../domain/repositories/ICartRepository';

export class RemoveFromCartUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(productId: string): Promise<void> {
    const items = await this.cartRepository.getCart();
    const updatedItems = items.filter(i => i.product.id !== productId);
    await this.cartRepository.saveCart(updatedItems);
  }
}
