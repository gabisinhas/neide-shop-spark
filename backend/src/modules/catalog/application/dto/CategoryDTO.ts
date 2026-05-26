import { Category } from '../../domain/entities/Category';

export type CategoryDTO = Category;

export type CreateCategoryDTO = Pick<Category, 'name' | 'slug' | 'description'>;

export type UpdateCategoryDTO = Partial<Pick<Category, 'name' | 'slug' | 'description'>>;