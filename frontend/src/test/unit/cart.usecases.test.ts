import { describe, expect, it } from 'vitest';
import { AddToCartUseCase } from '../../application/usecases/cart/AddToCartUseCase';
import { ClearCartUseCase } from '../../application/usecases/cart/ClearCartUseCase';
import { RemoveFromCartUseCase } from '../../application/usecases/cart/RemoveFromCartUseCase';
import { UpdateCartQuantityUseCase } from '../../application/usecases/cart/UpdateCartQuantityUseCase';
import type { CartItem } from '../../domain/entities/CartItem';
import type { Product } from '../../domain/entities/Product';
import type { ICartRepository } from '../../domain/repositories/ICartRepository';

class InMemoryCartRepository implements ICartRepository {
  constructor(private items: CartItem[] = []) {}

  async getCart(): Promise<CartItem[]> {
    return this.items;
  }

  async saveCart(items: CartItem[]): Promise<void> {
    this.items = items;
  }
}

const product: Product = {
  id: '1',
  name: 'Saia Cetim',
  price: 129.9,
  image: 'skirt.jpg',
  category: 'roupas',
};

describe('cart use cases', () => {
  it('adds a product and increments quantity for repeated additions', async () => {
    const repository = new InMemoryCartRepository();
    const useCase = new AddToCartUseCase(repository);

    await useCase.execute(product);
    await useCase.execute(product);

    await expect(repository.getCart()).resolves.toEqual([{ product, quantity: 2 }]);
  });

  it('updates quantity, removes an item and clears the cart', async () => {
    const repository = new InMemoryCartRepository([{ product, quantity: 1 }]);
    const updateUseCase = new UpdateCartQuantityUseCase(repository);
    const removeUseCase = new RemoveFromCartUseCase(repository);
    const clearUseCase = new ClearCartUseCase(repository);

    await updateUseCase.execute(product.id, 3);
    await expect(repository.getCart()).resolves.toEqual([{ product, quantity: 3 }]);

    await removeUseCase.execute(product.id);
    await expect(repository.getCart()).resolves.toEqual([]);

    await repository.saveCart([{ product, quantity: 2 }]);
    await clearUseCase.execute();
    await expect(repository.getCart()).resolves.toEqual([]);
  });
});