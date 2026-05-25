import { getPool } from '../../server/db';
import { MercadoPagoGateway } from '../modules/billing/infra/mercadoPago/MercadoPagoGateway';
import { AuditModule } from '../modules/audit/infra/AuditModule';
import { BillingModule } from '../modules/billing/infra/BillingModule';
import { CatalogModule } from '../modules/catalog/infra/CatalogModule';
import { IdentityModule } from '../modules/identity/infra/IdentityModule';
import { SalesModule } from '../modules/sales/infra/SalesModule';
import { ShippingModule } from '../modules/shipping/infra/ShippingModule';
import { UploadsModule } from '../modules/uploads/infra/UploadsModule';

export function createDependencies() {
  const pool = getPool();
  const audit = new AuditModule(pool);
  const identity = new IdentityModule(pool, audit.createAuditLog);
  const shipping = new ShippingModule();
  const uploads = new UploadsModule();
  const sales = new SalesModule(pool, identity.userRepository, shipping.calculateShipping);
  const billing = new BillingModule(new MercadoPagoGateway(), sales.orderRepository);

  return {
    pool,
    audit,
    catalog: new CatalogModule(pool),
    identity,
    sales,
    billing,
    shipping,
    uploads,
  };
}

export type AppDependencies = ReturnType<typeof createDependencies>;
