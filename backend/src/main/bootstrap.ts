import express from 'express';
import { ensureAuditSchema } from '../modules/audit/infra/database/ensureAuditSchema';
import { ensureIdentitySchema } from '../modules/identity/infra/database/ensureIdentitySchema';
import { ensureCatalogSchema } from '../modules/catalog/infra/database/ensureCatalogSchema';
import { ensureSalesSchema } from '../modules/sales/infra/database/ensureSalesSchema';
import { logger } from '../shared/infra/observability/logger';

export async function bootstrapServer(app: express.Express, port: number) {
  await ensureCatalogSchema();
  await ensureIdentitySchema();
  await ensureAuditSchema();
  await ensureSalesSchema();

  await new Promise<void>((resolve) => {
    app.listen(port, () => {
      logger.info({
        message: 'API server started.',
        route: 'server-bootstrap',
        status_code: 200,
        port,
      });
      resolve();
    });
  });
}
