import type { FastifyInstance } from 'fastify';
import * as schema from '../db/schema.js';
import { eq, and, gte, lte, desc, asc } from 'drizzle-orm';
import type { App } from '../index.js';

// Helper to get date string (YYYY-MM-DD)
function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper to get dates for range
function getDatesForRange(daysBack: number): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  return {
    startDate: getDateString(startDate),
    endDate: getDateString(endDate),
  };
}

export function register(app: App, fastify: FastifyInstance) {
  // GET trending wellness programs
  fastify.get('/api/insights/trending', async (request, reply) => {
    app.logger.info({ path: '/api/insights/trending' }, 'Fetching trending programs');

    try {
      // Get last 7 days and previous 7 days
      const current7Days = getDatesForRange(7);
      const previous7Days = getDatesForRange(14);

      // Get analytics for programs from last 7 days
      const currentAnalytics = await app.db
        .select({
          program_id: schema.programAnalytics.program_id,
          total_users: schema.programAnalytics.active_users,
        })
        .from(schema.programAnalytics)
        .where(
          and(
            gte(schema.programAnalytics.date, current7Days.startDate),
            lte(schema.programAnalytics.date, current7Days.endDate)
          )
        );

      // Get analytics for programs from previous 7 days
      const previousAnalytics = await app.db
        .select({
          program_id: schema.programAnalytics.program_id,
          total_users: schema.programAnalytics.active_users,
        })
        .from(schema.programAnalytics)
        .where(
          and(
            gte(schema.programAnalytics.date, previous7Days.startDate),
            lte(schema.programAnalytics.date, previous7Days.endDate)
          )
        );

      // Group by program_id and calculate totals
      const currentByProgram = new Map<string, number>();
      const previousByProgram = new Map<string, number>();

      currentAnalytics.forEach((row) => {
        const current = currentByProgram.get(row.program_id) || 0;
        currentByProgram.set(row.program_id, current + (row.total_users || 0));
      });

      previousAnalytics.forEach((row) => {
        const previous = previousByProgram.get(row.program_id) || 0;
        previousByProgram.set(row.program_id, previous + (row.total_users || 0));
      });

      // Get all programs and enrich with analytics
      const allPrograms = await app.db.select().from(schema.wellnessPrograms);

      const trendingData = allPrograms
        .map((program) => {
          const currentUsers = currentByProgram.get(program.id) || 0;
          const previousUsers = previousByProgram.get(program.id) || 0;
          const growth = previousUsers > 0 ? ((currentUsers - previousUsers) / previousUsers) * 100 : 0;

          return {
            id: program.id,
            title: program.title,
            category: program.program_type,
            participants: currentUsers,
            growth: Math.round(growth * 10) / 10,
            icon: getIconForType(program.program_type),
            color: getColorForType(program.program_type),
          };
        })
        .sort((a, b) => b.participants - a.participants)
        .slice(0, 5);

      app.logger.info({ count: trendingData.length }, 'Successfully fetched trending programs');
      return trendingData;
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch trending programs');
      throw error;
    }
  });

  // GET community insights
  fastify.get('/api/insights/community', async (request, reply) => {
    app.logger.info({ path: '/api/insights/community' }, 'Fetching community insights');

    try {
      const insights = await app.db
        .select()
        .from(schema.communityInsights)
        .where(eq(schema.communityInsights.is_active, true))
        .orderBy(asc(schema.communityInsights.display_order), desc(schema.communityInsights.created_at));

      app.logger.info({ count: insights.length }, 'Successfully fetched community insights');
      return insights.map((insight) => ({
        id: insight.id,
        title: insight.title,
        description: insight.description,
        type: insight.insight_type,
      }));
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch community insights');
      throw error;
    }
  });

  // POST record program analytics
  fastify.post('/api/insights/analytics/record', async (request, reply) => {
    const { program_id, date, active_users, completions } = request.body as {
      program_id: string;
      date: string;
      active_users: number;
      completions: number;
    };

    app.logger.info({ program_id, date, active_users, completions }, 'Recording program analytics');

    try {
      // Check if record for this program and date exists
      const existing = await app.db
        .select()
        .from(schema.programAnalytics)
        .where(
          and(
            eq(schema.programAnalytics.program_id, program_id),
            eq(schema.programAnalytics.date, date)
          )
        );

      let result;
      if (existing.length > 0) {
        // Update existing record
        result = await app.db
          .update(schema.programAnalytics)
          .set({
            active_users: active_users || 0,
            completions: completions || 0,
          })
          .where(
            and(
              eq(schema.programAnalytics.program_id, program_id),
              eq(schema.programAnalytics.date, date)
            )
          )
          .returning();

        app.logger.info({ program_id, date }, 'Analytics record updated');
      } else {
        // Create new record
        result = await app.db
          .insert(schema.programAnalytics)
          .values({
            program_id,
            date,
            active_users: active_users || 0,
            completions: completions || 0,
          })
          .returning();

        app.logger.info({ program_id, date }, 'Analytics record created');
      }

      return { success: true };
    } catch (error) {
      app.logger.error({ err: error, program_id, date }, 'Failed to record analytics');
      throw error;
    }
  });

  // GET overall wellness statistics
  fastify.get('/api/insights/stats', async (request, reply) => {
    app.logger.info({ path: '/api/insights/stats' }, 'Fetching wellness statistics');

    try {
      // Get analytics for last 30 days
      const last30Days = getDatesForRange(30);

      const recentAnalytics = await app.db
        .select()
        .from(schema.programAnalytics)
        .where(
          and(
            gte(schema.programAnalytics.date, last30Days.startDate),
            lte(schema.programAnalytics.date, last30Days.endDate)
          )
        );

      // Calculate total active users (deduplicated across days)
      const totalActiveUsers = recentAnalytics.reduce((max, row) => {
        return Math.max(max, row.active_users || 0);
      }, 0);

      // Calculate completion rate
      const totalCompletions = recentAnalytics.reduce((sum, row) => sum + (row.completions || 0), 0);
      const totalPossible = recentAnalytics.length * 100; // Estimate
      const completionRate = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0;

      // Get trending categories (program types)
      const allPrograms = await app.db.select().from(schema.wellnessPrograms);
      const programsByType = new Map<string, number>();

      recentAnalytics.forEach((analytic) => {
        const program = allPrograms.find((p) => p.id === analytic.program_id);
        if (program) {
          const current = programsByType.get(program.program_type) || 0;
          programsByType.set(program.program_type, current + (analytic.active_users || 0));
        }
      });

      const trendingCategories = Array.from(programsByType.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category]) => category);

      const stats = {
        total_active_users: totalActiveUsers,
        most_popular_time: '8:00 AM', // Default - could be calculated from more detailed timestamp data
        completion_rate: completionRate,
        trending_categories: trendingCategories,
      };

      app.logger.info(stats, 'Successfully calculated wellness statistics');
      return stats;
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch wellness statistics');
      throw error;
    }
  });
}

// Helper to get icon for program type
function getIconForType(programType: string): string {
  const icons: Record<string, string> = {
    stress_relief: '🧘',
    energy_reset: '⚡',
    gratitude: '🙏',
    mindfulness: '🧠',
    sleep_mastery: '😴',
    self_compassion: '💗',
  };
  return icons[programType] || '✨';
}

// Helper to get color for program type
function getColorForType(programType: string): string {
  const colors: Record<string, string> = {
    stress_relief: '#8B7BA8',
    energy_reset: '#FDB913',
    gratitude: '#FF6B6B',
    mindfulness: '#4ECDC4',
    sleep_mastery: '#2C3E50',
    self_compassion: '#FFB6C1',
  };
  return colors[programType] || '#9B9B9B';
}
