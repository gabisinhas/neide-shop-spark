import { describe, expect, it } from 'vitest';
import { CreateProductUseCase } from '../../application/usecases/product/CreateProductUseCase';
import { GetAllProductsUseCase } from '../../application/usecases/product/GetAllProductsUseCase';
import type { Product } from '../../domain/entities/Product';
import type { IProductRepository } from '../../domain/repositories/IProductRepository';

class InMemoryProductRepository implements IProductRepository {
  constructor(private products: Product[] = []) {}

  async getAll(): Promise<Product[]> {
    return this.products;
  }

  async getById(id: string): Promise<Product | null> {
    return this.products.find((product) => product.id === id) ?? null;
  }

  async add(product: Product): Promise<void> {
    this.products.push(product);
  }

  async update(id: string, updated: Partial<Product>): Promise<void> {
    this.products = this.products.map((product) =>
      product.id === id ? { ...product, ...updated } : product,
    );
  }

  async remove(id: string): Promise<void> {
    this.products = this.products.filter((product) => product.id !== id);
  }
}

describe('product use cases', () => {
  it('returns all products from the repository', async () => {
    const repository = new InMemoryProductRepository([
      { id: '1', name: 'Vestido Midi', price: 199.9, image: 'dress.jpg', category: 'roupas' },
      { id: '2', name: 'Bolsa Tote', price: 149.9, image: 'bag.jpg', category: 'acessorios' },
    ]);

    const useCase = new GetAllProductsUseCase(repository);

    await expect(useCase.execute()).resolves.toHaveLength(2);
  });

  it('adds a new product to the repository', async () => {
    const repository = new InMemoryProductRepository();
    const useCase = new CreateProductUseCase(repository);
    const product: Product = {
      id: '3',
      name: 'Blusa Linho',
      price: 89.9,
      image: 'shirt.jpg',
      category: 'roupas',
      tag: 'lancamento',
    };

    await useCase.execute(product);

    await expect(repository.getAll()).resolves.toEqual([product]);
  });
});