import type { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';

export default async function healthRoutes(app: FastifyInstance) {
  app.get('/health/supabase', async (_req, reply) => {
    try {
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE!
      );
      const { error } = await supabase.from('menu_items').select('id').limit(1);
      if (error) {
        app.log.error({ err: error.message }, 'health/supabase failed');
        return reply.code(500).send({ ok: false, error: error.message });
      }
      return reply.send({ ok: true });
    } catch (err: any) {
      app.log.error({ err: err.message }, 'health/supabase crash');
      return reply.code(500).send({ ok: false, error: err.message });
    }
  });
}