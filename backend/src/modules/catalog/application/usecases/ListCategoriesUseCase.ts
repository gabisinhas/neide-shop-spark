import { CategoryRepository } from '../../domain/repositories/CategoryRepository';

export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute() {
    return this.categoryRepository.list();
  }
}