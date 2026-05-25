import { Product } from '../../../domain/entities/Product';
import { IProductRepository } from '../../../domain/repositories/IProductRepository';

export class CreateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(product: Product): Promise<void> {
    return this.productRepository.add(product);
  }
}
