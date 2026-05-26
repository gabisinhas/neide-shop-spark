import { randomUUID } from 'node:crypto';
import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { CreateCategoryDTO } from '../dto/CategoryDTO';
import { CategoryRepository } from '../../domain/repositories/CategoryRepository';
import { buildCategorySlug } from '../../domain/services/categorySlug';

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(input: CreateCategoryDTO) {
    const name = input.name.trim();
    const slugSource = input.slug?.trim() || name;
    const slug = buildCategorySlug(slugSource);

    if (!slug) {
      throw new ApplicationError('Slug da categoria invalido.', 400, 'CATEGORY_SLUG_INVALID');
    }

    const [existingByName, existingBySlug] = await Promise.all([
      this.categoryRepository.findByName(name),
      this.categoryRepository.findBySlug(slug),
    ]);

    if (existingByName || existingBySlug) {
      throw new ApplicationError('Categoria ja existe.', 409, 'CATEGORY_ALREADY_EXISTS');
    }

    return this.categoryRepository.create({
      id: randomUUID(),
      name,
      slug,
      description: input.description?.trim() || undefined,
    });
  }
}