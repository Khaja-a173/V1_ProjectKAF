import fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import path from 'node:path';
import dotenv from 'dotenv';
import 'dotenv/config';
import healthRoutes from './routes/health';

// Load env from repo root first (this file lives in server/src)
const repoRoot = path.resolve(process.cwd(), '..', '..');
dotenv.config({ path: path.join(repoRoot, '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env') }); // optional fallback

// Plugins
import supabasePlugin from './plugins/supabase';
import authPlugin from './plugins/auth';

// Routes (merged & canonical)
import authRoutes from './routes/auth';
import tenantRoutes from './routes/tenants';
import analyticsRoutes from './routes/analytics';
import qrRoutes from './routes/qr';
import menuRoutes from './routes/menu';
import cartRoutes from './routes/cart';
import checkoutRoutes from './routes/checkout';
import kdsRoutes from './routes/kds';
import receiptsRoutes from './routes/receipts';
import ordersRoutes from './routes/orders';
import tablesRoutes from './routes/tables';
import paymentsRoutes from './routes/payments';

export async function buildApp(): Promise<FastifyInstance> {
  const app: FastifyInstance = fastify({
    logger: { level: process.env.LOG_LEVEL || 'info' }
  });

  // Core plugins
  await app.register(sensible);
  await app.register(cors, { origin: true, credentials: true });
  await app.register(supabasePlugin);
  await app.register(authPlugin);
  await app.register(healthRoutes);

  // Health
  app.get('/_health', async () => ({ ok: true }));

  // Routes
  await app.register(authRoutes);
  await app.register(tenantRoutes);
  await app.register(analyticsRoutes);
  await app.register(qrRoutes);
  await app.register(menuRoutes);
  await app.register(cartRoutes);
  await app.register(checkoutRoutes);
  await app.register(kdsRoutes);
  await app.register(receiptsRoutes);
  await app.register(ordersRoutes);
  await app.register(tablesRoutes);

  // Register payments routes conditionally (mounted at /payments)
  const paymentsEnabled = process.env.ENABLE_PAYMENTS !== 'false';
  if (paymentsEnabled) {
    await app.register(paymentsRoutes, { prefix: '/payments' });
    app.log.info('Payments routes enabled at /payments');
  } else {
    app.log.info('Payment features disabled via ENABLE_PAYMENTS flag');
  }

  return app;
}

// Start the server when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT || 8080);
  const host = process.env.HOST || '0.0.0.0';
  buildApp()
    .then(app => app.listen({ port, host }))
    .then(() => {
      console.log(`[server] listening on http://${host}:${port}`);
    })
    .catch((err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
}