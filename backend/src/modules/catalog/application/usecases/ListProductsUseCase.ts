import { ProductRepository } from '../../domain/repositories/ProductRepository';

export class ListProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute() {
    return this.productRepository.list();
  }
}