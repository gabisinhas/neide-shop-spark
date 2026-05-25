import { ICartRepository } from '../../../domain/repositories/ICartRepository';

export class UpdateCartQuantityUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(productId: string, quantity: number): Promise<void> {
    const items = await this.cartRepository.getCart();
    
    if (quantity <= 0) {
      const updatedItems = items.filter(i => i.product.id !== productId);
      await this.cartRepository.saveCart(updatedItems);
      return;
    }

    const updatedItems = items.map(i => 
      i.product.id === productId ? { ...i, quantity } : i
    );
    await this.cartRepository.saveCart(updatedItems);
  }
}
