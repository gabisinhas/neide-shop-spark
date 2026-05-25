import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { ProductRepository } from '../../domain/repositories/ProductRepository';

export class GetProductByIdUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new ApplicationError('Produto nao encontrado.', 404);
    }

    return product;
  }
}