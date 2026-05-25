import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { Product } from '../types/product';
import { seedProducts } from './seedProducts';

type ProductRow = {
  id: string;
  name: string;
  price: string | number;
  original_price: string | number | null;
  image: string;
  category: string;
  tag: Product['tag'] | null;
  installments_count: number | null;
  installments_value: string | number | null;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured. Copy backend/.env.example to backend/.env and set your Postgres connection.');
}

export const pool = new Pool({
  connectionString,
});

export function getPool() {
  return pool;
}

function toProduct(row: ProductRow): Product {
  const installments =
    row.installments_count && row.installments_value
      ? {
          count: row.installments_count,
          value: Number(row.installments_value),
        }
      : undefined;

  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    originalPrice: row.original_price == null ? undefined : Number(row.original_price),
    image: row.image,
    category: row.category,
    tag: row.tag ?? undefined,
    installments,
  };
}

export async function ensureDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      original_price NUMERIC(10, 2),
      image TEXT NOT NULL,
      category TEXT NOT NULL,
      tag TEXT,
      installments_count INTEGER,
      installments_value NUMERIC(10, 2),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const { rows } = await pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM products');
  const count = Number(rows[0]?.count ?? '0');

  if (count > 0) {
    return;
  }

  for (const product of seedProducts) {
    await pool.query(
      `
        INSERT INTO products (
          id,
          name,
          price,
          original_price,
          image,
          category,
          tag,
          installments_count,
          installments_value
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        product.id,
        product.name,
        product.price,
        product.originalPrice ?? null,
        product.image,
        product.category,
        product.tag ?? null,
        product.installments?.count ?? null,
        product.installments?.value ?? null,
      ],
    );
  }
}

export async function listProducts() {
  const result = await pool.query<ProductRow>('SELECT * FROM products ORDER BY created_at DESC, id DESC');
  return result.rows.map(toProduct);
}

export async function findProductById(id: string) {
  const result = await pool.query<ProductRow>('SELECT * FROM products WHERE id = $1 LIMIT 1', [id]);
  return result.rows[0] ? toProduct(result.rows[0]) : null;
}

export async function createProduct(product: Product) {
  const id = product.id || randomUUID();

  await pool.query(
    `
      INSERT INTO products (
        id,
        name,
        price,
        original_price,
        image,
        category,
        tag,
        installments_count,
        installments_value
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
    [
      id,
      product.name,
      product.price,
      product.originalPrice ?? null,
      product.image,
      product.category,
      product.tag ?? null,
      product.installments?.count ?? null,
      product.installments?.value ?? null,
    ],
  );

  return findProductById(id);
}

export async function updateProduct(id: string, product: Partial<Product>) {
  const current = await findProductById(id);

  if (!current) {
    return null;
  }

  const merged: Product = {
    ...current,
    ...product,
    installments: product.installments ?? current.installments,
  };

  await pool.query(
    `
      UPDATE products
      SET
        name = $2,
        price = $3,
        original_price = $4,
        image = $5,
        category = $6,
        tag = $7,
        installments_count = $8,
        installments_value = $9,
        updated_at = NOW()
      WHERE id = $1
    `,
    [
      id,
      merged.name,
      merged.price,
      merged.originalPrice ?? null,
      merged.image,
      merged.category,
      merged.tag ?? null,
      merged.installments?.count ?? null,
      merged.installments?.value ?? null,
    ],
  );

  return findProductById(id);
}

export async function deleteProduct(id: string) {
  await pool.query('DELETE FROM products WHERE id = $1', [id]);
}
