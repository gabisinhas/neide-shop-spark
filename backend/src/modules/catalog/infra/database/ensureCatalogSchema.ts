import { randomUUID } from 'node:crypto';
import { ensureDatabase, getPool } from '../../../../../server/db';
import { buildCategorySlug } from '../../domain/services/categorySlug';

export async function ensureCatalogSchema() {
  await ensureDatabase();

  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      deleted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query('CREATE INDEX IF NOT EXISTS categories_deleted_at_idx ON categories(deleted_at)');
  await pool.query('CREATE INDEX IF NOT EXISTS categories_name_idx ON categories(LOWER(name))');
  await pool.query('CREATE INDEX IF NOT EXISTS categories_slug_idx ON categories(LOWER(slug))');

  const existingCategories = await pool.query<{ name: string }>(
    "SELECT DISTINCT category AS name FROM products WHERE category IS NOT NULL AND TRIM(category) <> ''",
  );

  for (const row of existingCategories.rows) {
    const name = row.name.trim();

    if (!name) {
      continue;
    }

    const alreadyExists = await pool.query<{ id: string }>(
      'SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND deleted_at IS NULL LIMIT 1',
      [name],
    );

    if (alreadyExists.rowCount) {
      continue;
    }

    await pool.query(
      `
        INSERT INTO categories (id, name, slug, description, created_at, updated_at)
        VALUES ($1, $2, $3, NULL, NOW(), NOW())
      `,
      [randomUUID(), name, buildCategorySlug(name)],
    );
  }
}