// server/src/routes/auth.ts
import type { FastifyInstance } from 'fastify';

export default async function authRoutes(app: FastifyInstance) {
  // Dev-friendly session endpoint
  app.get('/auth/me', async (req, reply) => {
    // ✅ Bypass in local development: always return an authenticated user
    if (process.env.NODE_ENV === 'development') {
      return reply.send({
        authenticated: true,
        user: {
          id: 'dev-user',
          email: 'dev@projectkaf.local',
          role: 'admin'
        }
      });
    }

    // In production, fallback to existing whoami logic
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) {
      return reply.code(401).send({ authenticated: false, reason: 'no_token' });
    }

    const token = h.slice('Bearer '.length).trim();
    if (!token) {
      return reply.code(401).send({ authenticated: false, reason: 'empty_token' });
    }

    const { data, error } = await app.supabase.auth.getUser(token);
    if (error || !data?.user) {
      app.log.warn({ error }, 'auth/me: auth.getUser failed');
      return reply.code(401).send({ authenticated: false, reason: 'invalid_token' });
    }

    return reply.send({ authenticated: true, user: data.user });
  });

  app.get('/auth/whoami', async (req, reply) => {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) {
      return reply.send({ authenticated: false, reason: 'no_token' });
    }

    const token = h.slice('Bearer '.length).trim();
    if (!token) {
      return reply.send({ authenticated: false, reason: 'empty_token' });
    }

    // 1) Validate token directly with Supabase
    const { data, error } = await app.supabase.auth.getUser(token);
    if (error || !data?.user) {
      app.log.warn({ error }, 'whoami: auth.getUser failed');
      return reply.send({ authenticated: false, reason: 'invalid_token' });
    }

    const user = data.user;

    // 2) Load memberships (no joins, robust)
    const { data: staff, error: staffErr } = await app.supabase
      .from('staff')
      .select('tenant_id, role')
      .eq('user_id', user.id);

    if (staffErr) {
      app.log.warn({ staffErr }, 'whoami: staff lookup failed');
      // still authenticated, just no memberships
      return reply.send({
        authenticated: true,
        user_id: user.id,
        email: user.email ?? null,
        memberships: [],
        tenant_ids: [],
        primary_tenant_id: null,
        note: 'staff_lookup_failed',
      });
    }

    const memberships = (staff ?? []).map((r: any) => ({
      tenant_id: r.tenant_id,
      role: r.role,
    }));

    return reply.send({
      authenticated: true,
      user_id: user.id,
      email: user.email ?? null,
      memberships,
      tenant_ids: memberships.map((m: any) => m.tenant_id),
      primary_tenant_id: memberships[0]?.tenant_id ?? null,
    });
  });
}