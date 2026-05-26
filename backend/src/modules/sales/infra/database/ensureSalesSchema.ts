import { getPool } from '../../../../../server/db';

export async function ensureSalesSchema() {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      status TEXT NOT NULL,
      subtotal NUMERIC(10, 2) NOT NULL,
      shipping_fee NUMERIC(10, 2) NOT NULL,
      total NUMERIC(10, 2) NOT NULL,
      payment_method TEXT NOT NULL,
      address JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id BIGSERIAL PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_price NUMERIC(10, 2) NOT NULL,
      product_original_price NUMERIC(10, 2),
      product_image TEXT NOT NULL,
      product_category TEXT NOT NULL,
      product_tag TEXT,
      quantity INTEGER NOT NULL CHECK (quantity > 0)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory_movements (
      id BIGSERIAL PRIMARY KEY,
      order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
      product_id TEXT NOT NULL,
      variant_id TEXT,
      movement_type TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      reason TEXT NOT NULL,
      actor_user_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query('CREATE INDEX IF NOT EXISTS inventory_movements_order_id_idx ON inventory_movements(order_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS inventory_movements_product_id_idx ON inventory_movements(product_id)');
}