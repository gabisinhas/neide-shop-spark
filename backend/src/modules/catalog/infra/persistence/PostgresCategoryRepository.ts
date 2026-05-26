import { Pool } from 'pg';
import { Category } from '../../domain/entities/Category';
import { CategoryRepository } from '../../domain/repositories/CategoryRepository';

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  deleted_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export class PostgresCategoryRepository implements CategoryRepository {
  constructor(private readonly pool: Pool) {}

  async list(): Promise<Category[]> {
    const result = await this.pool.query<CategoryRow>(
      'SELECT * FROM categories WHERE deleted_at IS NULL ORDER BY name ASC, created_at DESC',
    );

    return result.rows.map(this.toDomain);
  }

  async findById(id: string): Promise<Category | null> {
    const result = await this.pool.query<CategoryRow>(
      'SELECT * FROM categories WHERE id = $1 AND deleted_at IS NULL LIMIT 1',
      [id],
    );

    return result.rows[0] ? this.toDomain(result.rows[0]) : null;
  }

  async findByName(name: string): Promise<Category | null> {
    const result = await this.pool.query<CategoryRow>(
      'SELECT * FROM categories WHERE LOWER(name) = LOWER($1) AND deleted_at IS NULL LIMIT 1',
      [name.trim()],
    );

    return result.rows[0] ? this.toDomain(result.rows[0]) : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const result = await this.pool.query<CategoryRow>(
      'SELECT * FROM categories WHERE LOWER(slug) = LOWER($1) AND deleted_at IS NULL LIMIT 1',
      [slug.trim()],
    );

    return result.rows[0] ? this.toDomain(result.rows[0]) : null;
  }

  async create(category: Category): Promise<Category> {
    const result = await this.pool.query<CategoryRow>(
      `
        INSERT INTO categories (id, name, slug, description, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
      `,
      [category.id, category.name, category.slug, category.description ?? null],
    );

    return this.toDomain(result.rows[0]);
  }

  async update(id: string, category: Partial<Category>): Promise<Category | null> {
    const result = await this.pool.query<CategoryRow>(
      `
        UPDATE categories
        SET
          name = COALESCE($2, name),
          slug = COALESCE($3, slug),
          description = COALESCE($4, description),
          updated_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING *
      `,
      [id, category.name ?? null, category.slug ?? null, category.description ?? null],
    );

    return result.rows[0] ? this.toDomain(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query(
      `
        UPDATE categories
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
      `,
      [id],
    );

    return (result.rowCount ?? 0) > 0;
  }

  private toDomain(row: CategoryRow): Category {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description ?? undefined,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
      deletedAt: row.deleted_at ? new Date(row.deleted_at).toISOString() : undefined,
    };
  }
}