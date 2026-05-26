import { Category } from '../entities/Category';

export interface CategoryRepository {
  list(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  create(category: Category): Promise<Category>;
  update(id: string, category: Partial<Category>): Promise<Category | null>;
  delete(id: string): Promise<boolean>;
}