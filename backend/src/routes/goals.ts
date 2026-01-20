import type { FastifyInstance } from 'fastify';
import { eq, and, desc } from 'drizzle-orm';
import { wellnessGoals, activities, meditationSessions, workouts, nutritionLogs } from '../db/schema.js';
import type { App } from '../index.js';

export function register(app: App, fastify: FastifyInstance) {
  // GET /api/goals - Returns array of all active goals
  fastify.get('/api/goals', async (request, reply) => {
    app.logger.info({}, 'Fetching all goals');
    try {
      const goals = await app.db
        .select()
        .from(wellnessGoals)
        .where(eq(wellnessGoals.is_active, true));

      app.logger.info({ count: goals.length }, 'Goals fetched successfully');
      return goals;
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch goals');
      throw error;
    }
  });

  // POST /api/goals - Create a new goal
  fastify.post('/api/goals', async (request, reply) => {
    const body = request.body as {
      goal_type: string;
      target_value: number;
    };

    app.logger.info({ body }, 'Creating goal');
    try {
      const goal = await app.db
        .insert(wellnessGoals)
        .values({
          goal_type: body.goal_type,
          target_value: body.target_value,
          current_streak: 0,
          is_active: true,
        })
        .returning();

      app.logger.info({ goalId: goal[0].id }, 'Goal created successfully');
      return goal[0];
    } catch (error) {
      app.logger.error({ err: error, body }, 'Failed to create goal');
      throw error;
    }
  });

  // PUT /api/goals/:id - Update a goal
  fastify.put('/api/goals/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      target_value?: number;
      is_active?: boolean;
    };

    app.logger.info({ id, body }, 'Updating goal');
    try {
      const updateData: any = {};

      if (body.target_value !== undefined) {
        updateData.target_value = body.target_value;
      }
      if (body.is_active !== undefined) {
        updateData.is_active = body.is_active;
      }

      updateData.updated_at = new Date();

      const updated = await app.db
        .update(wellnessGoals)
        .set(updateData)
        .where(eq(wellnessGoals.id, id))
        .returning();

      if (updated.length === 0) {
        app.logger.warn({ id }, 'Goal not found for update');
        return reply.code(404).send({ error: 'Goal not found' });
      }

      app.logger.info({ id }, 'Goal updated successfully');
      return updated[0];
    } catch (error) {
      app.logger.error({ err: error, id, body }, 'Failed to update goal');
      throw error;
    }
  });

  // GET /api/goals/progress - Returns progress for all goals
  fastify.get('/api/goals/progress', async (request, reply) => {
    const { date } = request.query as { date: string };

    app.logger.info({ date }, 'Fetching goals progress');
    try {
      const goals = await app.db
        .select()
        .from(wellnessGoals)
        .where(eq(wellnessGoals.is_active, true));

      const progress = await Promise.all(
        goals.map(async (goal) => {
          let current = 0;

          if (goal.goal_type === 'daily_calories') {
            const logs = await app.db
              .select()
              .from(nutritionLogs)
              .where(eq(nutritionLogs.date, date));
            current = logs.reduce((sum, log) => sum + (log.calories || 0), 0);
          } else if (goal.goal_type === 'daily_protein') {
            const logs = await app.db
              .select()
              .from(nutritionLogs)
              .where(eq(nutritionLogs.date, date));
            current = logs.reduce((sum, log) => sum + (log.protein || 0), 0);
          } else if (goal.goal_type === 'weekly_workouts') {
            const weekStart = new Date(date);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekStartStr = weekStart.toISOString().split('T')[0];

            const workoutList = await app.db.select().from(workouts);
            current = workoutList.filter(
              (w) => w.date >= weekStartStr && w.date <= date
            ).length;
          } else if (goal.goal_type === 'daily_meditation') {
            const sessions = await app.db
              .select()
              .from(meditationSessions)
              .where(eq(meditationSessions.date, date));
            current = sessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
          } else if (goal.goal_type === 'daily_steps') {
            const activity = await app.db
              .select()
              .from(activities)
              .where(and(eq(activities.date, date), eq(activities.activity_type, 'steps')));
            current = activity.length > 0 ? activity[0].value : 0;
          } else if (goal.goal_type === 'daily_water') {
            const activity = await app.db
              .select()
              .from(activities)
              .where(and(eq(activities.date, date), eq(activities.activity_type, 'water')));
            current = activity.length > 0 ? activity[0].value : 0;
          } else if (goal.goal_type === 'daily_sleep') {
            const activity = await app.db
              .select()
              .from(activities)
              .where(and(eq(activities.date, date), eq(activities.activity_type, 'sleep')));
            current = activity.length > 0 ? activity[0].value : 0;
          }

          const percentage = goal.target_value > 0 ? Math.round((current / goal.target_value) * 100) : 0;
          const on_track = current >= goal.target_value;

          return {
            goal_type: goal.goal_type,
            target: goal.target_value,
            current,
            percentage,
            on_track,
          };
        })
      );

      app.logger.info({ date, count: progress.length }, 'Goals progress fetched successfully');
      return progress;
    } catch (error) {
      app.logger.error({ err: error, date }, 'Failed to fetch goals progress');
      throw error;
    }
  });

  // DELETE /api/goals/:id - Delete a goal
  fastify.delete('/api/goals/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    app.logger.info({ id }, 'Deleting goal');
    try {
      const deleted = await app.db
        .delete(wellnessGoals)
        .where(eq(wellnessGoals.id, id))
        .returning();

      if (deleted.length === 0) {
        app.logger.warn({ id }, 'Goal not found for deletion');
        return reply.code(404).send({ error: 'Goal not found' });
      }

      app.logger.info({ id }, 'Goal deleted successfully');
      return { success: true };
    } catch (error) {
      app.logger.error({ err: error, id }, 'Failed to delete goal');
      throw error;
    }
  });
}
