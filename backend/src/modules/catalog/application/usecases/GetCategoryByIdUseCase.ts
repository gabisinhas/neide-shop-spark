import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { CategoryRepository } from '../../domain/repositories/CategoryRepository';

export class GetCategoryByIdUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string) {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new ApplicationError('Categoria nao encontrada.', 404, 'CATEGORY_NOT_FOUND');
    }

    return category;
  }
}