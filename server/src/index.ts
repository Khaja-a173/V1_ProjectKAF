@@ .. @@
 import supabasePlugin from './plugins/supabase.js';
 import tenantRoutes from './routes/tenants.js';
+import healthRoutes from './routes/health.js';
+import authRoutes from './routes/auth.js';
import analyticsRoutes from './routes/analytics.js';
import kdsRoutes from './routes/kds.js';
import ordersRoutes from './routes/orders.js';
 
 const app = Fastify({ logger: true });
@@ .. @@
 // Register routes
 await app.register(tenantRoutes);
+await app.register(healthRoutes);
+await app.register(authRoutes);
await app.register(analyticsRoutes);
await app.register(kdsRoutes);
await app.register(ordersRoutes);
 
 // Health check endpoint
 app.get('/health', async () => ({ ok: true }));
@@ .. @@
 // Start server
-const port = Number(process.env.PORT ?? 8080);
const host = '0.0.0.0';
 const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';