import type { FastifyInstance } from 'fastify';
import { eq, desc } from 'drizzle-orm';
import { meditationSessions } from '../db/schema.js';
import type { App } from '../index.js';

export function register(app: App, fastify: FastifyInstance) {
  // GET /api/meditation/sessions - Returns array of meditation sessions
  fastify.get('/api/meditation/sessions', async (request, reply) => {
    const { date } = request.query as { date?: string };

    app.logger.info({ date }, 'Fetching meditation sessions');
    try {
      let sessions: any[] = [];

      if (date) {
        sessions = await app.db
          .select()
          .from(meditationSessions)
          .where(eq(meditationSessions.date, date))
          .orderBy(desc(meditationSessions.created_at));
      } else {
        sessions = await app.db
          .select()
          .from(meditationSessions)
          .orderBy(desc(meditationSessions.created_at));
      }

      app.logger.info({ count: sessions.length }, 'Meditation sessions fetched successfully');
      return sessions;
    } catch (error) {
      app.logger.error({ err: error, date }, 'Failed to fetch meditation sessions');
      throw error;
    }
  });

  // POST /api/meditation/sessions - Create a new meditation session
  fastify.post('/api/meditation/sessions', async (request, reply) => {
    const body = request.body as {
      date: string;
      practice_type: string;
      duration_minutes: number;
      mood_before?: string;
      mood_after?: string;
      notes?: string;
    };

    app.logger.info({ body }, 'Creating meditation session');
    try {
      const session = await app.db
        .insert(meditationSessions)
        .values({
          date: body.date,
          practice_type: body.practice_type,
          duration_minutes: body.duration_minutes,
          mood_before: body.mood_before || null,
          mood_after: body.mood_after || null,
          notes: body.notes || null,
        })
        .returning();

      app.logger.info({ sessionId: session[0].id }, 'Meditation session created successfully');
      return session[0];
    } catch (error) {
      app.logger.error({ err: error, body }, 'Failed to create meditation session');
      throw error;
    }
  });

  // GET /api/meditation/stats - Returns meditation statistics
  fastify.get('/api/meditation/stats', async (request, reply) => {
    app.logger.info({}, 'Fetching meditation stats');
    try {
      const sessions = await app.db.select().from(meditationSessions);

      const total_minutes = sessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
      const total_sessions = sessions.length;

      // Calculate practice breakdown
      const practice_breakdown: Record<string, number> = {};
      sessions.forEach((session) => {
        practice_breakdown[session.practice_type] = (practice_breakdown[session.practice_type] || 0) + 1;
      });

      // Calculate current streak (sessions on consecutive days)
      let current_streak = 0;
      if (sessions.length > 0) {
        const sortedSessions = sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const today = new Date();
        let checkDate = new Date(today);

        for (const session of sortedSessions) {
          const sessionDate = new Date(session.date);
          if (
            sessionDate.getFullYear() === checkDate.getFullYear() &&
            sessionDate.getMonth() === checkDate.getMonth() &&
            sessionDate.getDate() === checkDate.getDate()
          ) {
            current_streak++;
            checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
          } else {
            break;
          }
        }
      }

      const stats = {
        total_minutes,
        total_sessions,
        current_streak,
        practice_breakdown,
      };

      app.logger.info({ stats }, 'Meditation stats fetched successfully');
      return stats;
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch meditation stats');
      throw error;
    }
  });

  // DELETE /api/meditation/sessions/:id - Delete meditation session
  fastify.delete('/api/meditation/sessions/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    app.logger.info({ id }, 'Deleting meditation session');
    try {
      const deleted = await app.db
        .delete(meditationSessions)
        .where(eq(meditationSessions.id, id))
        .returning();

      if (deleted.length === 0) {
        app.logger.warn({ id }, 'Meditation session not found for deletion');
        return reply.code(404).send({ error: 'Meditation session not found' });
      }

      app.logger.info({ id }, 'Meditation session deleted successfully');
      return { success: true };
    } catch (error) {
      app.logger.error({ err: error, id }, 'Failed to delete meditation session');
      throw error;
    }
  });
}
