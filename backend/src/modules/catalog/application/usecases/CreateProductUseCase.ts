import { ProductValidationService } from '../../domain/services/ProductValidationService';
import { CreateProductDTO } from '../dto/ProductDTO';
import { ProductRepository } from '../../domain/repositories/ProductRepository';

export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: CreateProductDTO) {
    const product = {
      ...input,
      price: Number(input.price),
      salePrice: input.salePrice == null ? undefined : Number(input.salePrice),
      originalPrice: input.originalPrice == null ? undefined : Number(input.originalPrice),
      stockQuantity: input.stockQuantity == null ? undefined : Number(input.stockQuantity),
      weight: input.weight == null ? undefined : Number(input.weight),
      height: input.height == null ? undefined : Number(input.height),
      width: input.width == null ? undefined : Number(input.width),
      length: input.length == null ? undefined : Number(input.length),
    };

    ProductValidationService.validateForCreation(product);
    return this.productRepository.create(product);
  }
}
