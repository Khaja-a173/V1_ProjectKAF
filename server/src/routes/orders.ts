import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const CheckoutSchema = z.object({
  tenantId: z.string().uuid(),
  sessionId: z.string(),
  mode: z.enum(['table', 'takeaway']),
  tableId: z.string().uuid().optional(),
  cartVersion: z.number().int().min(0),
  totalCents: z.number().int().min(0),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price_cents: z.number().int(),
    qty: z.number().int().min(1)
  })).optional()
});

export default async function ordersRoutes(app: FastifyInstance) {
  // Idempotent checkout endpoint
  app.post('/orders/checkout', async (req, reply) => {
    try {
      const idempotencyKey = req.headers['idempotency-key'] as string;
      if (!idempotencyKey) {
        return reply.code(400).send({ error: 'idempotency_required' });
      }

      const body = CheckoutSchema.parse(req.body);
      
      // Call the database RPC function for atomic checkout
      const { data, error } = await app.supabase.rpc('app.checkout_order', {
        p_tenant_id: body.tenantId,
        p_session_id: body.sessionId,
        p_mode: body.mode,
        p_table_id: body.tableId || null,
        p_cart_version: body.cartVersion,
        p_idempotency_key: idempotencyKey,
        p_total_cents: body.totalCents
      });

      if (error) {
        app.log.error({ err: error }, 'Checkout RPC failed');
        
        // Handle specific error codes
        if (error.code === '55000') {
          if (error.message.includes('stale_cart')) {
            return reply.code(409).send({ error: 'stale_cart' });
          }
          if (error.message.includes('active_order_exists')) {
            return reply.code(409).send({ error: 'active_order_exists' });
          }
        }
        
        return reply.code(500).send({ error: 'Checkout failed' });
      }

      const result = data?.[0];
      if (!result) {
        return reply.code(500).send({ error: 'No result from checkout' });
      }

      const statusCode = result.duplicate ? 200 : 201;
      
      return reply.code(statusCode).send({
        order: {
          id: result.order_id,
          duplicate: result.duplicate
        }
      });
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return reply.code(400).send({ error: 'Invalid request body', details: err.errors });
      }
      
      app.log.error({ err: err.message }, 'Checkout endpoint failed');
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get order status
  app.get('/orders/:orderId', async (req, reply) => {
    try {
      const { orderId } = req.params as { orderId: string };
      
      const { data: order, error } = await app.supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          created_at,
          estimated_ready_time,
          order_items (
            id,
            quantity,
            total_price,
            menu_items (
              name
            )
          ),
          restaurant_tables (
            table_number
          )
        `)
        .eq('id', orderId)
        .single();

      if (error || !order) {
        return reply.code(404).send({ error: 'Order not found' });
      }

      return reply.send({
        order_id: order.id,
        order_number: order.order_number,
        status: order.status,
        current: order.status,
        total_amount: order.total_amount,
        table_number: order.restaurant_tables?.table_number,
        estimated_ready_time: order.estimated_ready_time,
        order_items: order.order_items,
        created_at: order.created_at
      });
    } catch (err: any) {
      app.log.error({ err: err.message }, 'Get order failed');
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}