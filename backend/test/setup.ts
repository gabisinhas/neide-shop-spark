import { ensureAuditSchema } from '../src/modules/audit/infra/database/ensureAuditSchema';
import { ensureCatalogSchema } from '../src/modules/catalog/infra/database/ensureCatalogSchema';
import { ensureIdentitySchema } from '../src/modules/identity/infra/database/ensureIdentitySchema';
import { ensureSalesSchema } from '../src/modules/sales/infra/database/ensureSalesSchema';
import { getPool } from '../server/db';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.AUTH_EXPOSE_PASSWORD_RESET_TOKEN = 'true';

  await ensureCatalogSchema();
  await ensureIdentitySchema();
  await ensureAuditSchema();
  await ensureSalesSchema();
});

afterAll(async () => {
  await getPool().end();
});
