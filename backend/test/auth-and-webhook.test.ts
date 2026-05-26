import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/main/app';
import { HandleMercadoPagoWebhookUseCase } from '../src/modules/billing/application/usecases/HandleMercadoPagoWebhookUseCase';
import { PaymentGateway } from '../src/modules/billing/domain/services/PaymentGateway';
import { PostgresOrderRepository } from '../src/modules/sales/infra/persistence/PostgresOrderRepository';
import { getPool } from '../server/db';

const app = createApp();
const pool = getPool();
let resetToken = '';

// Usuário de teste
const testUser = {
  name: 'Test User',
  email: 'test-forgot@example.com',
  password: 'SenhaForte123',
  address: {
    recipient: 'Test User',
    phone: '11999999999',
    street: 'Rua Teste',
    number: '123',
    district: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01001000',
  },
};

describe('Forgot/Reset Password API', () => {
  beforeAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    await request(app).post('/api/auth/register').send(testUser);
  });

  it('should request password reset and receive a token', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: testUser.email });

    expect(res.status).toBe(202);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('resetToken');
    expect(typeof res.body.resetToken).toBe('string');
    resetToken = res.body.resetToken;
  });

  it('should reset password with valid token and revoke sessions', async () => {
    const newPassword = 'NovaSenhaForte456';
    expect(resetToken).toBeTruthy();

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: resetToken, password: newPassword });
    expect(res.status).toBe(204);

    const loginOld = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(loginOld.status).toBe(401);

    const loginNew = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: newPassword });
    expect(loginNew.status).toBe(200);
    expect(loginNew.body).toHaveProperty('accessToken');
  });

  it('should not reset password with invalid/expired token', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'invalid-token', password: 'QualquerSenha123' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('code', 'PASSWORD_RESET_TOKEN_INVALID');
  });
});

describe('Payment Webhook', () => {
  it('should process payment event idempotently', async () => {
    const scenario = await createWebhookScenario();
    const gateway = createGatewayStub(scenario.orderId, 'approved');
    const useCase = new HandleMercadoPagoWebhookUseCase(gateway, new PostgresOrderRepository(pool));

    const result = await useCase.execute({ paymentId: randomUUID() });
    const order = await new PostgresOrderRepository(pool).findById(scenario.orderId);
    const stock = await getProductStock(scenario.productId);

    expect(result).toMatchObject({
      acknowledged: true,
      ignored: false,
      orderId: scenario.orderId,
      status: 'paid',
    });
    expect(order?.status).toBe('paid');
    expect(stock).toBe(scenario.initialStock - scenario.quantity);
  });

  it('should ignore duplicate webhook events', async () => {
    const scenario = await createWebhookScenario();
    const gateway = createGatewayStub(scenario.orderId, 'approved');
    const repository = new PostgresOrderRepository(pool);
    const useCase = new HandleMercadoPagoWebhookUseCase(gateway, repository);

    await useCase.execute({ paymentId: 'payment-1' });
    await useCase.execute({ paymentId: 'payment-1' });

    const order = await repository.findById(scenario.orderId);
    const stock = await getProductStock(scenario.productId);
    const movementCount = await countInventoryMovements(scenario.orderId, scenario.productId);

    expect(order?.status).toBe('paid');
    expect(stock).toBe(scenario.initialStock - scenario.quantity);
    expect(movementCount).toBe(1);
  });
});

function createGatewayStub(orderId: string, status: 'pending' | 'approved' | 'rejected'): PaymentGateway {
  return {
    async createCheckout() {
      throw new Error('Not implemented in tests.');
    },
    async getPayment() {
      return {
        externalReference: orderId,
        status,
      };
    },
  };
}

async function createWebhookScenario() {
  const userId = randomUUID();
  const orderId = randomUUID();
  const productId = randomUUID();
  const initialStock = 10;
  const quantity = 2;

  await pool.query('DELETE FROM inventory_movements WHERE order_id = $1', [orderId]);
  await pool.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
  await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  await pool.query('DELETE FROM "Product" WHERE id = $1', [productId]);

  await pool.query(
    `
      INSERT INTO users (id, name, email, role, provider, password_hash, created_at, updated_at)
      VALUES ($1, $2, $3, 'customer', 'email', $4, NOW(), NOW())
    `,
    [userId, 'Webhook User', `webhook-${userId}@example.com`, 'hashed-password'],
  );

  await pool.query(
    `
      INSERT INTO "Product" (
        "id", "name", "price", "salePrice", "originalPrice", "description", "sku", "stockQuantity", "weight", "height", "width", "length", "image", "category", "createdAt", "updatedAt", "deletedAt"
      )
      VALUES ($1, $2, $3, NULL, $4, '', $5, $6, 0, 0, 0, 0, $7, $8, NOW(), NOW(), NULL)
    `,
    [productId, 'Produto Webhook', 100, 100, `SKU-${productId}`, initialStock, '/img.png', 'Teste'],
  );

  const repository = new PostgresOrderRepository(pool);
  await repository.create({
    id: orderId,
    userId,
    userName: 'Webhook User',
    userEmail: `webhook-${userId}@example.com`,
    status: 'pending_payment',
    subtotal: 200,
    shippingFee: 0,
    total: 200,
    paymentMethod: 'pix',
    address: {
      recipient: 'Webhook User',
      phone: '11999999999',
      street: 'Rua Teste',
      number: '100',
      district: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01001000',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        quantity,
        product: {
          id: productId,
          name: 'Produto Webhook',
          price: 100,
          originalPrice: 100,
          image: '/img.png',
          category: 'Teste',
        },
      },
    ],
  });

  return {
    orderId,
    productId,
    initialStock,
    quantity,
  };
}

async function getProductStock(productId: string) {
  const result = await pool.query<{ stockQuantity: number }>('SELECT "stockQuantity" FROM "Product" WHERE id = $1 LIMIT 1', [productId]);
  return result.rows[0]?.stockQuantity ?? null;
}

async function countInventoryMovements(orderId: string, productId: string) {
  const result = await pool.query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM inventory_movements WHERE order_id = $1 AND product_id = $2',
    [orderId, productId],
  );

  return Number(result.rows[0]?.count ?? '0');
}
