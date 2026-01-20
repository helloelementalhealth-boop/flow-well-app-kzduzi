import type { FastifyInstance } from 'fastify';
import { eq, and, desc } from 'drizzle-orm';
import { nutritionLogs, workouts, workoutExercises, meditationSessions, activities, wellnessGoals } from '../db/schema.js';
import type { App } from '../index.js';

export function register(app: App, fastify: FastifyInstance) {
  // GET /api/dashboard/overview - Returns comprehensive overview
  fastify.get('/api/dashboard/overview', async (request, reply) => {
    const { date } = request.query as { date: string };

    app.logger.info({ date }, 'Fetching dashboard overview');
    try {
      // Nutrition data
      const nutritionData = await app.db
        .select()
        .from(nutritionLogs)
        .where(eq(nutritionLogs.date, date));

      const nutrition = {
        total_calories: nutritionData.reduce((sum, log) => sum + (log.calories || 0), 0),
        total_protein: nutritionData.reduce((sum, log) => sum + (log.protein || 0), 0),
        total_carbs: nutritionData.reduce((sum, log) => sum + (log.carbs || 0), 0),
        total_fats: nutritionData.reduce((sum, log) => sum + (log.fats || 0), 0),
        meal_count: nutritionData.length,
      };

      // Workouts data
      const workoutData = await app.db
        .select()
        .from(workouts)
        .where(eq(workouts.date, date));

      const workoutExerciseData = await Promise.all(
        workoutData.map(async (workout) => {
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

      const workoutOverview = {
        total_workouts: workoutData.length,
        total_duration: workoutData.reduce((sum, w) => sum + (w.duration_minutes || 0), 0),
        total_calories_burned: workoutData.reduce((sum, w) => sum + (w.calories_burned || 0), 0),
        workout_types: Array.from(
          new Set(workoutData.map((w) => w.workout_type))
        ).reduce(
          (acc, type) => {
            acc[type] = workoutData.filter((w) => w.workout_type === type).length;
            return acc;
          },
          {} as Record<string, number>
        ),
      };

      // Meditation data
      const meditationData = await app.db
        .select()
        .from(meditationSessions)
        .where(eq(meditationSessions.date, date));

      const meditation = {
        total_sessions: meditationData.length,
        total_minutes: meditationData.reduce((sum, session) => sum + (session.duration_minutes || 0), 0),
        practice_breakdown: Array.from(
          new Set(meditationData.map((m) => m.practice_type))
        ).reduce(
          (acc, type) => {
            acc[type] = meditationData.filter((m) => m.practice_type === type).length;
            return acc;
          },
          {} as Record<string, number>
        ),
      };

      // Activities data
      const activityData = await app.db
        .select()
        .from(activities)
        .where(eq(activities.date, date));

      const activitySummary = {
        steps: 0,
        sleep_hours: 0,
        water_glasses: 0,
        mood_rating: 0,
      };

      activityData.forEach((activity) => {
        if (activity.activity_type === 'steps') {
          activitySummary.steps = activity.value;
        } else if (activity.activity_type === 'sleep') {
          activitySummary.sleep_hours = activity.value;
        } else if (activity.activity_type === 'water') {
          activitySummary.water_glasses = activity.value;
        } else if (activity.activity_type === 'mood_check') {
          activitySummary.mood_rating = activity.value;
        }
      });

      // Goals progress
      const activeGoals = await app.db
        .select()
        .from(wellnessGoals)
        .where(eq(wellnessGoals.is_active, true));

      const goalsProgress = await Promise.all(
        activeGoals.map(async (goal) => {
          let current = 0;

          if (goal.goal_type === 'daily_calories') {
            current = nutrition.total_calories;
          } else if (goal.goal_type === 'daily_protein') {
            current = nutrition.total_protein;
          } else if (goal.goal_type === 'weekly_workouts') {
            const weekStart = new Date(date);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekStartStr = weekStart.toISOString().split('T')[0];

            const workoutList = await app.db.select().from(workouts);
            current = workoutList.filter(
              (w) => w.date >= weekStartStr && w.date <= date
            ).length;
          } else if (goal.goal_type === 'daily_meditation') {
            current = meditation.total_minutes;
          } else if (goal.goal_type === 'daily_steps') {
            current = activitySummary.steps;
          } else if (goal.goal_type === 'daily_water') {
            current = activitySummary.water_glasses;
          } else if (goal.goal_type === 'daily_sleep') {
            current = activitySummary.sleep_hours;
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

      const overview = {
        date,
        nutrition,
        workouts: workoutOverview,
        meditation,
        activities: activitySummary,
        goals_progress: goalsProgress,
      };

      app.logger.info({ date }, 'Dashboard overview fetched successfully');
      return overview;
    } catch (error) {
      app.logger.error({ err: error, date }, 'Failed to fetch dashboard overview');
      throw error;
    }
  });
}
