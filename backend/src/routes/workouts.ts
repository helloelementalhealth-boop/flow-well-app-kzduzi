import type { FastifyInstance } from 'fastify';
import { eq, desc } from 'drizzle-orm';
import { workouts, workoutExercises } from '../db/schema.js';
import type { App } from '../index.js';

export function register(app: App, fastify: FastifyInstance) {
  // GET /api/workouts - Returns array of workouts with exercises
  fastify.get('/api/workouts', async (request, reply) => {
    const { date } = request.query as { date?: string };

    app.logger.info({ date }, 'Fetching workouts');
    try {
      let workoutList: any[] = [];

      if (date) {
        workoutList = await app.db
          .select()
          .from(workouts)
          .where(eq(workouts.date, date))
          .orderBy(desc(workouts.created_at));
      } else {
        workoutList = await app.db
          .select()
          .from(workouts)
          .orderBy(desc(workouts.created_at));
      }

      // Fetch exercises for each workout
      const workoutsWithExercises = await Promise.all(
        workoutList.map(async (workout) => {
          const exercises = await app.db
            .select()
            .from(workoutExercises)
            .where(eq(workoutExercises.workout_id, workout.id));

          return {
            ...workout,
            exercises,
          };
        })
      );

      app.logger.info({ count: workoutList.length }, 'Workouts fetched successfully');
      return workoutsWithExercises;
    } catch (error) {
      app.logger.error({ err: error, date }, 'Failed to fetch workouts');
      throw error;
    }
  });

  // POST /api/workouts - Create a new workout with exercises
  fastify.post('/api/workouts', async (request, reply) => {
    const body = request.body as {
      date: string;
      workout_type: string;
      title: string;
      duration_minutes: number;
      calories_burned?: number;
      notes?: string;
      exercises: Array<{
        exercise_name: string;
        sets?: number;
        reps?: number;
        weight?: number;
        duration_seconds?: number;
      }>;
    };

    app.logger.info({ body }, 'Creating workout');
    try {
      // Create workout
      const createdWorkout = await app.db
        .insert(workouts)
        .values({
          date: body.date,
          workout_type: body.workout_type,
          title: body.title,
          duration_minutes: body.duration_minutes,
          calories_burned: body.calories_burned || null,
          notes: body.notes || null,
        })
        .returning();

      const workout = createdWorkout[0];

      // Create exercises
      let exercises: any[] = [];
      if (body.exercises && body.exercises.length > 0) {
        exercises = await app.db
          .insert(workoutExercises)
          .values(
            body.exercises.map((ex) => ({
              workout_id: workout.id,
              exercise_name: ex.exercise_name,
              sets: ex.sets || null,
              reps: ex.reps || null,
              weight: ex.weight || null,
              duration_seconds: ex.duration_seconds || null,
            }))
          )
          .returning();
      }

      app.logger.info({ workoutId: workout.id }, 'Workout created successfully');
      return { ...workout, exercises };
    } catch (error) {
      app.logger.error({ err: error, body }, 'Failed to create workout');
      throw error;
    }
  });

  // GET /api/workouts/:id - Returns workout with all exercises
  fastify.get('/api/workouts/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    app.logger.info({ id }, 'Fetching workout by ID');
    try {
      const workout = await app.db
        .select()
        .from(workouts)
        .where(eq(workouts.id, id))
        .limit(1);

      if (workout.length === 0) {
        app.logger.warn({ id }, 'Workout not found');
        return reply.code(404).send({ error: 'Workout not found' });
      }

      const exercises = await app.db
        .select()
        .from(workoutExercises)
        .where(eq(workoutExercises.workout_id, id));

      app.logger.info({ id }, 'Workout fetched successfully');
      return { ...workout[0], exercises };
    } catch (error) {
      app.logger.error({ err: error, id }, 'Failed to fetch workout');
      throw error;
    }
  });

  // DELETE /api/workouts/:id - Delete workout and exercises
  fastify.delete('/api/workouts/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    app.logger.info({ id }, 'Deleting workout');
    try {
      // Delete exercises first
      await app.db
        .delete(workoutExercises)
        .where(eq(workoutExercises.workout_id, id));

      // Delete workout
      const deleted = await app.db
        .delete(workouts)
        .where(eq(workouts.id, id))
        .returning();

      if (deleted.length === 0) {
        app.logger.warn({ id }, 'Workout not found for deletion');
        return reply.code(404).send({ error: 'Workout not found' });
      }

      app.logger.info({ id }, 'Workout deleted successfully');
      return { success: true };
    } catch (error) {
      app.logger.error({ err: error, id }, 'Failed to delete workout');
      throw error;
    }
  });
}
