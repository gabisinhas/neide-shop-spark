import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { ProductValidationService } from '../../domain/services/ProductValidationService';
import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { UpdateProductDTO } from '../dto/ProductDTO';

export class UpdateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string, input: UpdateProductDTO) {
    const payload = {
      ...input,
      price: input.price == null ? undefined : Number(input.price),
      salePrice: input.salePrice == null ? undefined : Number(input.salePrice),
      originalPrice: input.originalPrice == null ? undefined : Number(input.originalPrice),
      stockQuantity: input.stockQuantity == null ? undefined : Number(input.stockQuantity),
      weight: input.weight == null ? undefined : Number(input.weight),
      height: input.height == null ? undefined : Number(input.height),
      width: input.width == null ? undefined : Number(input.width),
      length: input.length == null ? undefined : Number(input.length),
    };

    ProductValidationService.validateForUpdate(payload);
    const product = await this.productRepository.update(id, payload);

    if (!product) {
      throw new ApplicationError('Produto nao encontrado.', 404);
    }

    return product;
  }
}
