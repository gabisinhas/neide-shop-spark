import { Product } from '../../../domain/entities/Product';
import { ICartRepository } from '../../../domain/repositories/ICartRepository';

export class AddToCartUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(product: Product): Promise<void> {
    const items = await this.cartRepository.getCart();
    const existingIndex = items.findIndex(i => i.product.id === product.id);

    if (existingIndex >= 0) {
      items[existingIndex].quantity += 1;
    } else {
      items.push({ product, quantity: 1 });
    }

    await this.cartRepository.saveCart(items);
  }
}
