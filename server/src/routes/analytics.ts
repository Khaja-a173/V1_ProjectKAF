import type { FastifyInstance } from 'fastify';

export default async function analyticsRoutes(app: FastifyInstance) {
  // Revenue timeseries endpoint
  app.get('/analytics/revenue_timeseries', async (req, reply) => {
    try {
      const { range = '7d', interval = 'day' } = req.query as any;
      
      // Mock data for development - replace with actual DB queries
      const mockSeries = [
        { bucket: '2025-01-14', revenue_total: 1250.50 },
        { bucket: '2025-01-15', revenue_total: 1380.75 },
        { bucket: '2025-01-16', revenue_total: 1120.25 },
      ];

      return reply.send({
        range,
        interval,
        series: mockSeries,
        total: mockSeries.reduce((sum, item) => sum + item.revenue_total, 0).toFixed(2)
      });
    } catch (err: any) {
      app.log.error({ err: err.message }, 'analytics/revenue_timeseries failed');
      return reply.code(500).send({ error: 'Failed to fetch revenue data' });
    }
  });

  // Payment conversion funnel endpoint
  app.get('/analytics/payment_conversion_funnel', async (req, reply) => {
    try {
      const { range = '7d' } = req.query as any;
      
      // Mock funnel data
      const mockRows = [
        { stage: 'initiated', value: 150 },
        { stage: 'processing', value: 145 },
        { stage: 'succeeded', value: 138 },
        { stage: 'failed', value: 7 },
      ];

      return reply.send({
        range,
        rows: mockRows
      });
    } catch (err: any) {
      app.log.error({ err: err.message }, 'analytics/payment_conversion_funnel failed');
      return reply.code(500).send({ error: 'Failed to fetch funnel data' });
    }
  });

  // Order fulfillment timeline endpoint
  app.get('/analytics/order_fulfillment_timeline', async (req, reply) => {
    try {
      const { range = '7d' } = req.query as any;
      
      // Mock fulfillment data
      const mockRows = [
        { step: 'placed_to_confirmed', p50_ms: 120000, p95_ms: 300000 },
        { step: 'confirmed_to_preparing', p50_ms: 180000, p95_ms: 420000 },
        { step: 'preparing_to_ready', p50_ms: 900000, p95_ms: 1800000 },
        { step: 'ready_to_served', p50_ms: 240000, p95_ms: 600000 },
      ];

      return reply.send({
        range,
        rows: mockRows
      });
    } catch (err: any) {
      app.log.error({ err: err.message }, 'analytics/order_fulfillment_timeline failed');
      return reply.code(500).send({ error: 'Failed to fetch fulfillment data' });
    }
  });

  // Peak hours heatmap endpoint
  app.get('/analytics/peak_hours_heatmap', async (req, reply) => {
    try {
      const { range = '7d' } = req.query as any;
      
      // Mock heatmap data
      const mockData = {
        range,
        heatmap: [
          { hour: 11, day: 'Monday', orders: 8 },
          { hour: 12, day: 'Monday', orders: 15 },
          { hour: 13, day: 'Monday', orders: 22 },
          { hour: 18, day: 'Monday', orders: 25 },
          { hour: 19, day: 'Monday', orders: 28 },
        ]
      };

      return reply.send(mockData);
    } catch (err: any) {
      app.log.error({ err: err.message }, 'analytics/peak_hours_heatmap failed');
      return reply.code(500).send({ error: 'Failed to fetch heatmap data' });
    }
  });

  // Revenue breakdown endpoint
  app.get('/analytics/revenue_breakdown', async (req, reply) => {
    try {
      const { bucket = 'day', by = 'category', interval = 'day' } = req.query as any;
      
      // Mock breakdown data
      const mockData = {
        bucket,
        by,
        interval,
        breakdown: [
          { category: 'Appetizers', revenue: 450.25, orders: 28 },
          { category: 'Main Courses', revenue: 1250.75, orders: 45 },
          { category: 'Desserts', revenue: 320.50, orders: 22 },
          { category: 'Beverages', revenue: 180.00, orders: 35 },
        ]
      };

      return reply.send(mockData);
    } catch (err: any) {
      app.log.error({ err: err.message }, 'analytics/revenue_breakdown failed');
      return reply.code(500).send({ error: 'Failed to fetch breakdown data' });
    }
  });
}