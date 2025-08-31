import type { FastifyInstance } from 'fastify';

export default async function kdsRoutes(app: FastifyInstance) {
  // Check if KDS is enabled
  const isEnabled = process.env.ENABLE_KDS === 'true';
  
  if (!isEnabled) {
    app.get('/kds/*', async (_req, reply) => {
      return reply.code(503).send({ error: 'KDS feature is disabled' });
    });
    return;
  }

  // Get KDS orders grouped by kitchen state
  app.get('/kds/orders', async (req, reply) => {
    try {
      const { data: orders, error } = await app.supabase
        .from('orders')
        .select(`
          id,
          order_number,
          kitchen_state,
          status,
          total_amount,
          special_instructions,
          created_at,
          order_items (
            id,
            quantity,
            menu_items (
              name,
              preparation_time,
              image_url
            )
          ),
          restaurant_tables (
            table_number
          )
        `)
        .in('status', ['confirmed', 'preparing', 'ready'])
        .order('created_at', { ascending: true });

      if (error) {
        app.log.error({ err: error }, 'Failed to fetch KDS orders');
        return reply.code(500).send({ error: 'Failed to fetch orders' });
      }

      // Group orders by kitchen state
      const grouped = {
        queued: orders?.filter(o => o.kitchen_state === 'queued' || o.status === 'confirmed') || [],
        preparing: orders?.filter(o => o.kitchen_state === 'preparing' || o.status === 'preparing') || [],
        ready: orders?.filter(o => o.kitchen_state === 'ready' || o.status === 'ready') || [],
      };

      return reply.send({ orders: grouped });
    } catch (err: any) {
      app.log.error({ err: err.message }, 'KDS orders endpoint failed');
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get KDS lane counts
  app.get('/kds/lanes', async (req, reply) => {
    try {
      const { data: orders, error } = await app.supabase
        .from('orders')
        .select('kitchen_state, status')
        .in('status', ['confirmed', 'preparing', 'ready']);

      if (error) {
        app.log.error({ err: error }, 'Failed to fetch lane counts');
        return reply.code(500).send({ error: 'Failed to fetch lane counts' });
      }

      const counts = {
        tenant_id: 'current_tenant',
        queued: orders?.filter(o => o.kitchen_state === 'queued' || o.status === 'confirmed').length || 0,
        preparing: orders?.filter(o => o.kitchen_state === 'preparing' || o.status === 'preparing').length || 0,
        ready: orders?.filter(o => o.kitchen_state === 'ready' || o.status === 'ready').length || 0,
      };

      return reply.send(counts);
    } catch (err: any) {
      app.log.error({ err: err.message }, 'KDS lanes endpoint failed');
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Advance order state
  app.post('/kds/orders/:orderId/advance', async (req, reply) => {
    try {
      const { orderId } = req.params as { orderId: string };
      const { to_state } = req.body as { to_state: string };

      const validStates = ['queued', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
      if (!validStates.includes(to_state)) {
        return reply.code(400).send({ error: 'Invalid state' });
      }

      // Update kitchen state and order status
      const updates: any = { kitchen_state: to_state };
      
      // Map kitchen states to order statuses
      if (to_state === 'preparing') updates.status = 'preparing';
      if (to_state === 'ready') updates.status = 'ready';
      if (to_state === 'served') updates.status = 'served';

      const { error } = await app.supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) {
        app.log.error({ err: error }, 'Failed to advance order');
        return reply.code(500).send({ error: 'Failed to update order' });
      }

      return reply.send({ 
        ok: true, 
        order_id: orderId, 
        status: to_state 
      });
    } catch (err: any) {
      app.log.error({ err: err.message }, 'KDS advance endpoint failed');
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}