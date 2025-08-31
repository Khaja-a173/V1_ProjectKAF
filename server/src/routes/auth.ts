import type { FastifyInstance } from 'fastify';

export default async function authRoutes(app: FastifyInstance) {
  app.get('/auth/me', async (req, reply) => {
    if (process.env.NODE_ENV === 'development') {
      return reply.send({
        authenticated: true,
        user: { id: 'dev-user', email: 'dev@projectkaf.local', role: 'admin' }
      });
    }
    const h = req.headers.authorization;
    if (!h?.startsWith('Bearer ')) {
      return reply.code(401).send({ authenticated: false, reason: 'no_token' });
    }
    const token = h.slice('Bearer '.length).trim();
    const { data, error } = await app.supabase.auth.getUser(token);
    if (error || !data?.user) {
      return reply.code(401).send({ authenticated: false, reason: 'invalid_token' });
    }
    return reply.send({ authenticated: true, user: data.user });
  });

  app.get('/auth/session', async (req, reply) => {
    // Mirror /auth/me behavior for clients that call /auth/session
    if (process.env.NODE_ENV === 'development') {
      return reply.send({
        authenticated: true,
        user: { id: 'dev-user', email: 'dev@projectkaf.local', role: 'admin' }
      });
    }
    const h = req.headers.authorization;
    if (!h?.startsWith('Bearer ')) {
      return reply.code(401).send({ authenticated: false, reason: 'no_token' });
    }
    const token = h.slice('Bearer '.length).trim();
    const { data, error } = await app.supabase.auth.getUser(token);
    if (error || !data?.user) {
      return reply.code(401).send({ authenticated: false, reason: 'invalid_token' });
    }
    return reply.send({ authenticated: true, user: data.user });
  });
}