import 'dotenv/config';
import { createApp } from '../src/main/app';
import { bootstrapServer } from '../src/main/bootstrap';
import { logger } from '../src/shared/infra/observability/logger';

const port = Number(process.env.PORT || 3001);

bootstrapServer(createApp(), port).catch((error) => {
  logger.error({
    message: 'Failed to initialize backend.',
    route: 'server-init',
    code: 'BACKEND_BOOTSTRAP_FAILED',
    error,
  });
  process.exit(1);
});
