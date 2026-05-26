import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { CategoryRepository } from '../../domain/repositories/CategoryRepository';

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string) {
    const deleted = await this.categoryRepository.delete(id);

    if (!deleted) {
      throw new ApplicationError('Categoria nao encontrada.', 404, 'CATEGORY_NOT_FOUND');
    }
  }
}