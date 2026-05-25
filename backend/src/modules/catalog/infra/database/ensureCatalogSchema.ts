import { ensureDatabase } from '../../../../../server/db';

export async function ensureCatalogSchema() {
  await ensureDatabase();
}