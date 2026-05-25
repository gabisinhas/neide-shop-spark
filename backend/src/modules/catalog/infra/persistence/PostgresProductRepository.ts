import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { Product } from '../../domain/entities/Product';
import { ProductRepository } from '../../domain/repositories/ProductRepository';

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

export class PostgresProductRepository implements ProductRepository {
  constructor(private readonly pool: Pool) {}

  async list() {
    const result = await this.pool.query<ProductRow>('SELECT * FROM products ORDER BY created_at DESC, id DESC');
    return result.rows.map(this.toProduct);
  }

  async findById(id: string) {
    const result = await this.pool.query<ProductRow>('SELECT * FROM products WHERE id = $1 LIMIT 1', [id]);
    return result.rows[0] ? this.toProduct(result.rows[0]) : null;
  }

  async create(product: Product) {
    const id = product.id || randomUUID();

    await this.pool.query(
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

    return (await this.findById(id)) as Product;
  }

  async update(id: string, product: Partial<Product>) {
    const current = await this.findById(id);

    if (!current) {
      return null;
    }

    const merged: Product = {
      ...current,
      ...product,
      installments: product.installments ?? current.installments,
    };

    await this.pool.query(
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

    return this.findById(id);
  }

  async delete(id: string) {
    await this.pool.query('DELETE FROM products WHERE id = $1', [id]);
  }

  private toProduct(row: ProductRow): Product {
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
}