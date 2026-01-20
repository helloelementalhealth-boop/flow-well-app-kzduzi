import type { FastifyInstance } from 'fastify';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { nutritionLogs } from '../db/schema.js';
import type { App } from '../index.js';

export function register(app: App, fastify: FastifyInstance) {
  // GET /api/nutrition/logs - Returns array of nutrition logs
  fastify.get('/api/nutrition/logs', async (request, reply) => {
    const { date } = request.query as { date?: string };

    app.logger.info({ date }, 'Fetching nutrition logs');
    try {
      let logs: any[] = [];

      if (date) {
        logs = await app.db
          .select()
          .from(nutritionLogs)
          .where(eq(nutritionLogs.date, date))
          .orderBy(desc(nutritionLogs.created_at));
      } else {
        logs = await app.db
          .select()
          .from(nutritionLogs)
          .orderBy(desc(nutritionLogs.created_at));
      }

      app.logger.info({ count: logs.length }, 'Nutrition logs fetched successfully');
      return logs;
    } catch (error) {
      app.logger.error({ err: error, date }, 'Failed to fetch nutrition logs');
      throw error;
    }
  });

  // POST /api/nutrition/logs - Create a new nutrition log
  fastify.post('/api/nutrition/logs', async (request, reply) => {
    const body = request.body as {
      date: string;
      meal_type: string;
      food_name: string;
      calories: number;
      protein?: number;
      carbs?: number;
      fats?: number;
      notes?: string;
    };

    app.logger.info({ body }, 'Creating nutrition log');
    try {
      const log = await app.db
        .insert(nutritionLogs)
        .values({
          date: body.date,
          meal_type: body.meal_type,
          food_name: body.food_name,
          calories: body.calories,
          protein: body.protein || null,
          carbs: body.carbs || null,
          fats: body.fats || null,
          notes: body.notes || null,
        })
        .returning();

      app.logger.info({ logId: log[0].id }, 'Nutrition log created successfully');
      return log[0];
    } catch (error) {
      app.logger.error({ err: error, body }, 'Failed to create nutrition log');
      throw error;
    }
  });

  // GET /api/nutrition/summary - Returns daily summary
  fastify.get('/api/nutrition/summary', async (request, reply) => {
    const { date } = request.query as { date: string };

    app.logger.info({ date }, 'Fetching nutrition summary');
    try {
      const logs = await app.db
        .select()
        .from(nutritionLogs)
        .where(eq(nutritionLogs.date, date));

      const total_calories = logs.reduce((sum, log) => sum + (log.calories || 0), 0);
      const total_protein = logs.reduce((sum, log) => sum + (log.protein || 0), 0);
      const total_carbs = logs.reduce((sum, log) => sum + (log.carbs || 0), 0);
      const total_fats = logs.reduce((sum, log) => sum + (log.fats || 0), 0);

      const summary = {
        total_calories,
        total_protein,
        total_carbs,
        total_fats,
        meals: logs,
      };

      app.logger.info({ date, summary }, 'Nutrition summary fetched successfully');
      return summary;
    } catch (error) {
      app.logger.error({ err: error, date }, 'Failed to fetch nutrition summary');
      throw error;
    }
  });

  // DELETE /api/nutrition/logs/:id - Delete nutrition log
  fastify.delete('/api/nutrition/logs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    app.logger.info({ id }, 'Deleting nutrition log');
    try {
      const deleted = await app.db
        .delete(nutritionLogs)
        .where(eq(nutritionLogs.id, id))
        .returning();

      if (deleted.length === 0) {
        app.logger.warn({ id }, 'Nutrition log not found for deletion');
        return reply.code(404).send({ error: 'Nutrition log not found' });
      }

      app.logger.info({ id }, 'Nutrition log deleted successfully');
      return { success: true };
    } catch (error) {
      app.logger.error({ err: error, id }, 'Failed to delete nutrition log');
      throw error;
    }
  });
}
