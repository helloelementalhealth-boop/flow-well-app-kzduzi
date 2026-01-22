import type { FastifyInstance } from 'fastify';
import * as schema from '../db/schema.js';
import { eq, and, or } from 'drizzle-orm';
import type { App } from '../index.js';

// Helper to get current season based on month
function getSeason(month: number): string {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter'; // 12, 1, 2
}

export function register(app: App, fastify: FastifyInstance) {
  // GET current visual based on date
  fastify.get('/api/renewal/visuals/current', async (request, reply) => {
    app.logger.info({ path: '/api/renewal/visuals/current' }, 'Fetching current renewal visual');

    try {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0-6
      const month = now.getMonth() + 1; // 1-12
      const season = getSeason(month);

      app.logger.debug({ dayOfWeek, month, season }, 'Current date values');

      // Priority: seasonal > monthly > daily
      let visual = null;

      // Try seasonal first
      visual = await app.db
        .select()
        .from(schema.renewalVisuals)
        .where(and(eq(schema.renewalVisuals.visual_type, 'seasonal'), eq(schema.renewalVisuals.season, season)))
        .limit(1);

      if (visual.length > 0) {
        app.logger.info({ visualId: visual[0].id, type: 'seasonal' }, 'Returning seasonal visual');
        return {
          id: visual[0].id,
          image_url: visual[0].image_url,
          description: visual[0].description,
          visual_type: visual[0].visual_type,
        };
      }

      // Try monthly
      visual = await app.db
        .select()
        .from(schema.renewalVisuals)
        .where(and(eq(schema.renewalVisuals.visual_type, 'monthly'), eq(schema.renewalVisuals.month, month)))
        .limit(1);

      if (visual.length > 0) {
        app.logger.info({ visualId: visual[0].id, type: 'monthly' }, 'Returning monthly visual');
        return {
          id: visual[0].id,
          image_url: visual[0].image_url,
          description: visual[0].description,
          visual_type: visual[0].visual_type,
        };
      }

      // Try daily
      visual = await app.db
        .select()
        .from(schema.renewalVisuals)
        .where(and(eq(schema.renewalVisuals.visual_type, 'daily'), eq(schema.renewalVisuals.day_of_week, dayOfWeek)))
        .limit(1);

      if (visual.length > 0) {
        app.logger.info({ visualId: visual[0].id, type: 'daily' }, 'Returning daily visual');
        return {
          id: visual[0].id,
          image_url: visual[0].image_url,
          description: visual[0].description,
          visual_type: visual[0].visual_type,
        };
      }

      // Fallback to any visual
      visual = await app.db.select().from(schema.renewalVisuals).limit(1);

      if (visual.length > 0) {
        app.logger.warn({ visualId: visual[0].id }, 'No matching visual found, returning fallback');
        return {
          id: visual[0].id,
          image_url: visual[0].image_url,
          description: visual[0].description,
          visual_type: visual[0].visual_type,
        };
      }

      app.logger.warn({}, 'No renewal visuals available');
      return reply.status(404).send({ error: 'No visuals available' });
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch current renewal visual');
      throw error;
    }
  });
}
