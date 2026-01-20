import type { FastifyInstance } from 'fastify';
import { eq, and, desc } from 'drizzle-orm';
import { activities } from '../db/schema.js';
import type { App } from '../index.js';

export function register(app: App, fastify: FastifyInstance) {
  // GET /api/activities - Returns array of activities
  fastify.get('/api/activities', async (request, reply) => {
    const { date, type } = request.query as { date?: string; type?: string };

    app.logger.info({ date, type }, 'Fetching activities');
    try {
      let activityList: any[] = [];

      if (date && type) {
        activityList = await app.db
          .select()
          .from(activities)
          .where(and(eq(activities.date, date), eq(activities.activity_type, type)))
          .orderBy(desc(activities.created_at));
      } else if (date) {
        activityList = await app.db
          .select()
          .from(activities)
          .where(eq(activities.date, date))
          .orderBy(desc(activities.created_at));
      } else if (type) {
        activityList = await app.db
          .select()
          .from(activities)
          .where(eq(activities.activity_type, type))
          .orderBy(desc(activities.created_at));
      } else {
        activityList = await app.db
          .select()
          .from(activities)
          .orderBy(desc(activities.created_at));
      }

      app.logger.info({ count: activityList.length }, 'Activities fetched successfully');
      return activityList;
    } catch (error) {
      app.logger.error({ err: error, date, type }, 'Failed to fetch activities');
      throw error;
    }
  });

  // POST /api/activities - Create a new activity
  fastify.post('/api/activities', async (request, reply) => {
    const body = request.body as {
      date: string;
      activity_type: string;
      value: number;
      notes?: string;
    };

    app.logger.info({ body }, 'Creating activity');
    try {
      const activity = await app.db
        .insert(activities)
        .values({
          date: body.date,
          activity_type: body.activity_type,
          value: body.value,
          notes: body.notes || null,
        })
        .returning();

      app.logger.info({ activityId: activity[0].id }, 'Activity created successfully');
      return activity[0];
    } catch (error) {
      app.logger.error({ err: error, body }, 'Failed to create activity');
      throw error;
    }
  });

  // GET /api/activities/summary - Returns daily summary
  fastify.get('/api/activities/summary', async (request, reply) => {
    const { date } = request.query as { date: string };

    app.logger.info({ date }, 'Fetching activities summary');
    try {
      const activityList = await app.db
        .select()
        .from(activities)
        .where(eq(activities.date, date));

      const summary = {
        steps: 0,
        sleep_hours: 0,
        water_glasses: 0,
        mood_rating: 0,
      };

      activityList.forEach((activity) => {
        if (activity.activity_type === 'steps') {
          summary.steps = activity.value;
        } else if (activity.activity_type === 'sleep') {
          summary.sleep_hours = activity.value;
        } else if (activity.activity_type === 'water') {
          summary.water_glasses = activity.value;
        } else if (activity.activity_type === 'mood_check') {
          summary.mood_rating = activity.value;
        }
      });

      app.logger.info({ date, summary }, 'Activities summary fetched successfully');
      return summary;
    } catch (error) {
      app.logger.error({ err: error, date }, 'Failed to fetch activities summary');
      throw error;
    }
  });

  // DELETE /api/activities/:id - Delete activity
  fastify.delete('/api/activities/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    app.logger.info({ id }, 'Deleting activity');
    try {
      const deleted = await app.db
        .delete(activities)
        .where(eq(activities.id, id))
        .returning();

      if (deleted.length === 0) {
        app.logger.warn({ id }, 'Activity not found for deletion');
        return reply.code(404).send({ error: 'Activity not found' });
      }

      app.logger.info({ id }, 'Activity deleted successfully');
      return { success: true };
    } catch (error) {
      app.logger.error({ err: error, id }, 'Failed to delete activity');
      throw error;
    }
  });
}
