import { ProductValidationService } from '../../domain/services/ProductValidationService';
import { CreateProductDTO } from '../dto/ProductDTO';
import { CategoryRepository } from '../../domain/repositories/CategoryRepository';
import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { ApplicationError } from '../../../../shared/application/ApplicationError';

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

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
    const category = await this.categoryRepository.findByName(product.category);

    if (!category) {
      throw new ApplicationError('Categoria nao encontrada.', 400, 'CATEGORY_NOT_FOUND');
    }

    return this.productRepository.create({
      ...product,
      category: category.name,
    });
  }
}
