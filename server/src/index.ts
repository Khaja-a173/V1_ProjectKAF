import Fastify from 'fastify';
import cors from '@fastify/cors';
import supabasePlugin from './plugins/supabase.js';
import tenantRoutes from './routes/tenants.js';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import analyticsRoutes from './routes/analytics.js';
import kdsRoutes from './routes/kds.js';
import ordersRoutes from './routes/orders.js';

const app = Fastify({ logger: true });

// Register CORS
await app.register(cors, {
  origin: true,
  credentials: true,
});

// Register Supabase plugin
await app.register(supabasePlugin);

// Register routes
await app.register(tenantRoutes);
await app.register(healthRoutes);
await app.register(authRoutes);
await app.register(analyticsRoutes);
await app.register(kdsRoutes);
await app.register(ordersRoutes);

// Health check endpoint
app.get('/health', async () => ({ ok: true }));

// Start server
const port = Number(process.env.PORT ?? 8090);
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

try {
  await app.listen({ port, host });
  console.log(`Server running on http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}