import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { UpdateCategoryDTO } from '../dto/CategoryDTO';
import { CategoryRepository } from '../../domain/repositories/CategoryRepository';
import { buildCategorySlug } from '../../domain/services/categorySlug';

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string, input: UpdateCategoryDTO) {
    const existing = await this.categoryRepository.findById(id);

    if (!existing) {
      throw new ApplicationError('Categoria nao encontrada.', 404, 'CATEGORY_NOT_FOUND');
    }

    const name = input.name?.trim() || existing.name;
    const slug = buildCategorySlug(input.slug?.trim() || input.name?.trim() || existing.slug);

    if (!slug) {
      throw new ApplicationError('Slug da categoria invalido.', 400, 'CATEGORY_SLUG_INVALID');
    }

    const [existingByName, existingBySlug] = await Promise.all([
      this.categoryRepository.findByName(name),
      this.categoryRepository.findBySlug(slug),
    ]);

    if ((existingByName && existingByName.id !== id) || (existingBySlug && existingBySlug.id !== id)) {
      throw new ApplicationError('Categoria ja existe.', 409, 'CATEGORY_ALREADY_EXISTS');
    }

    const category = await this.categoryRepository.update(id, {
      name,
      slug,
      description: input.description?.trim() || existing.description,
    });

    if (!category) {
      throw new ApplicationError('Categoria nao encontrada.', 404, 'CATEGORY_NOT_FOUND');
    }

    return category;
  }
}