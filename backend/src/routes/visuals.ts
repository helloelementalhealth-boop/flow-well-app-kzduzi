import type { FastifyInstance } from 'fastify';
import { eq, and } from 'drizzle-orm';
import { rhythmVisuals } from '../db/schema.js';
import type { App } from '../index.js';

export function register(app: App, fastify: FastifyInstance) {
  // GET /api/visuals/rhythms - Returns visuals for current month
  fastify.get('/api/visuals/rhythms', async (request, reply) => {
    const currentMonth = new Date().getMonth() + 1; // 1-12

    app.logger.info({ currentMonth }, 'Fetching rhythm visuals for current month');
    try {
      const visuals = await app.db
        .select()
        .from(rhythmVisuals)
        .where(eq(rhythmVisuals.month_active, currentMonth));

      const formattedVisuals = visuals.map((visual) => ({
        id: visual.id,
        rhythm_category: visual.rhythm_category,
        rhythm_name: visual.rhythm_name,
        image_url: visual.image_url,
        video_url: visual.video_url,
        display_order: visual.display_order,
      }));

      app.logger.info({ count: visuals.length }, 'Rhythm visuals fetched successfully');
      return formattedVisuals;
    } catch (error) {
      app.logger.error({ err: error, currentMonth }, 'Failed to fetch rhythm visuals');
      throw error;
    }
  });

  // GET /api/visuals/rhythms/:category - Returns visuals for specific category
  fastify.get('/api/visuals/rhythms/:category', async (request, reply) => {
    const { category } = request.params as { category: string };
    const currentMonth = new Date().getMonth() + 1; // 1-12

    app.logger.info({ category, currentMonth }, 'Fetching rhythm visuals by category');
    try {
      const visuals = await app.db
        .select()
        .from(rhythmVisuals)
        .where(
          and(
            eq(rhythmVisuals.rhythm_category, category),
            eq(rhythmVisuals.month_active, currentMonth)
          )
        );

      const formattedVisuals = visuals.map((visual) => ({
        id: visual.id,
        rhythm_category: visual.rhythm_category,
        rhythm_name: visual.rhythm_name,
        image_url: visual.image_url,
        video_url: visual.video_url,
        display_order: visual.display_order,
      }));

      app.logger.info({ category, count: visuals.length }, 'Rhythm visuals by category fetched successfully');
      return formattedVisuals;
    } catch (error) {
      app.logger.error({ err: error, category, currentMonth }, 'Failed to fetch rhythm visuals by category');
      throw error;
    }
  });

  // POST /api/visuals/rhythms - Create new visual
  fastify.post('/api/visuals/rhythms', async (request, reply) => {
    const body = request.body as {
      rhythm_category: string;
      rhythm_name: string;
      image_url: string;
      video_url?: string;
      month_active: number;
      display_order?: number;
    };

    app.logger.info({ body }, 'Creating new rhythm visual');
    try {
      const visual = await app.db
        .insert(rhythmVisuals)
        .values({
          rhythm_category: body.rhythm_category,
          rhythm_name: body.rhythm_name,
          image_url: body.image_url,
          video_url: body.video_url || null,
          month_active: body.month_active,
          display_order: body.display_order || 0,
        })
        .returning();

      const formattedVisual = {
        id: visual[0].id,
        rhythm_category: visual[0].rhythm_category,
        rhythm_name: visual[0].rhythm_name,
        image_url: visual[0].image_url,
        video_url: visual[0].video_url,
        display_order: visual[0].display_order,
      };

      app.logger.info({ visualId: visual[0].id }, 'Rhythm visual created successfully');
      return formattedVisual;
    } catch (error) {
      app.logger.error({ err: error, body }, 'Failed to create rhythm visual');
      throw error;
    }
  });
}
