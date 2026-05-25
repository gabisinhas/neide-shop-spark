import { Pool, PoolClient } from 'pg';
import { Product } from '../../../catalog/domain/entities/Product';
import { Address } from '../../../identity/domain/entities/User';
import { Order, OrderItem } from '../../domain/entities/Order';
import { OrderRepository } from '../../domain/repositories/OrderRepository';

type OrderRow = {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  status: Order['status'];
  subtotal: string | number;
  shipping_fee: string | number;
  total: string | number;
  payment_method: Order['paymentMethod'];
  address: Address;
  created_at: Date | string;
  updated_at: Date | string;
};

type OrderItemRow = {
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: string | number;
  product_original_price: string | number | null;
  product_image: string;
  product_category: string;
  product_tag: Product['tag'] | null;
  quantity: number;
};

export class PostgresOrderRepository implements OrderRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string) {
    const result = await this.pool.query<OrderRow>('SELECT * FROM orders WHERE id = $1 LIMIT 1', [id]);

    if (!result.rows[0]) {
      return null;
    }

    const items = await this.loadItems([id]);
    return this.toOrder(result.rows[0], items.get(id) ?? []);
  }

  async findByUserId(userId: string) {
    const result = await this.pool.query<OrderRow>('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return this.attachItems(result.rows);
  }

  async list() {
    const result = await this.pool.query<OrderRow>('SELECT * FROM orders ORDER BY created_at DESC');
    return this.attachItems(result.rows);
  }

  async create(order: Order) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      await client.query(
        `
          INSERT INTO orders (
            id,
            user_id,
            user_name,
            user_email,
            status,
            subtotal,
            shipping_fee,
            total,
            payment_method,
            address,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12)
        `,
        [
          order.id,
          order.userId,
          order.userName,
          order.userEmail,
          order.status,
          order.subtotal,
          order.shippingFee,
          order.total,
          order.paymentMethod,
          JSON.stringify(order.address),
          order.createdAt,
          order.updatedAt,
        ],
      );

      for (const item of order.items) {
        await this.insertItem(client, order.id, item);
      }

      await client.query('COMMIT');
      return (await this.findById(order.id)) as Order;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateStatus(orderId: string, status: Order['status']) {
    await this.pool.query('UPDATE orders SET status = $2, updated_at = NOW() WHERE id = $1', [orderId, status]);
    return this.findById(orderId);
  }

  private async insertItem(client: PoolClient, orderId: string, item: OrderItem) {
    await client.query(
      `
        INSERT INTO order_items (
          order_id,
          product_id,
        product_name,
        product_price,
        product_original_price,
          product_image,
          product_category,
          product_tag,
          quantity
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        orderId,
        item.product.id,
        item.product.name,
        item.product.salePrice ?? item.product.price,
        item.product.salePrice != null ? item.product.price : item.product.originalPrice ?? null,
        item.product.image,
        item.product.category,
        item.product.tag ?? null,
        item.quantity,
      ],
    );
  }

  private async attachItems(rows: OrderRow[]) {
    const orderIds = rows.map((row) => row.id);
    const items = await this.loadItems(orderIds);
    return rows.map((row) => this.toOrder(row, items.get(row.id) ?? []));
  }

  private async loadItems(orderIds: string[]) {
    const itemsByOrder = new Map<string, OrderItem[]>();

    if (!orderIds.length) {
      return itemsByOrder;
    }

    const result = await this.pool.query<OrderItemRow>(
      'SELECT * FROM order_items WHERE order_id = ANY($1::text[]) ORDER BY id ASC',
      [orderIds],
    );

    for (const row of result.rows) {
      const current = itemsByOrder.get(row.order_id) ?? [];
      current.push({
        product: {
          id: row.product_id,
          name: row.product_name,
          price: Number(row.product_price),
          originalPrice: row.product_original_price == null ? undefined : Number(row.product_original_price),
          image: row.product_image,
          category: row.product_category,
          tag: row.product_tag ?? undefined,
        },
        quantity: row.quantity,
      });
      itemsByOrder.set(row.order_id, current);
    }

    return itemsByOrder;
  }

  private toOrder(row: OrderRow, items: OrderItem[]): Order {
    return {
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      items,
      status: row.status,
      subtotal: Number(row.subtotal),
      shippingFee: Number(row.shipping_fee),
      total: Number(row.total),
      paymentMethod: row.payment_method,
      address: row.address,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }
}
