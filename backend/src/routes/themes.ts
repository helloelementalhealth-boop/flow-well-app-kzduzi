import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { visualThemes } from '../db/schema.js';
import type { App } from '../index.js';

export function register(app: App, fastify: FastifyInstance) {
  // GET /api/themes - Returns all available themes
  fastify.get('/api/themes', async (request, reply) => {
    app.logger.info({}, 'Fetching all themes');
    try {
      const themes = await app.db.select().from(visualThemes);

      const formattedThemes = themes.map((theme) => ({
        id: theme.id,
        theme_name: theme.theme_name,
        colors: {
          background_color: theme.background_color,
          card_color: theme.card_color,
          text_color: theme.text_color,
          text_secondary_color: theme.text_secondary_color,
          primary_color: theme.primary_color,
          secondary_color: theme.secondary_color,
          accent_color: theme.accent_color,
        },
        is_active: theme.is_active,
      }));

      app.logger.info({ count: themes.length }, 'Themes fetched successfully');
      return formattedThemes;
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch themes');
      throw error;
    }
  });

  // GET /api/themes/:id - Returns specific theme details
  fastify.get('/api/themes/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    app.logger.info({ id }, 'Fetching theme by ID');
    try {
      const theme = await app.db
        .select()
        .from(visualThemes)
        .where(eq(visualThemes.id, id))
        .limit(1);

      if (theme.length === 0) {
        app.logger.warn({ id }, 'Theme not found');
        return reply.code(404).send({ error: 'Theme not found' });
      }

      const formattedTheme = {
        id: theme[0].id,
        theme_name: theme[0].theme_name,
        colors: {
          background_color: theme[0].background_color,
          card_color: theme[0].card_color,
          text_color: theme[0].text_color,
          text_secondary_color: theme[0].text_secondary_color,
          primary_color: theme[0].primary_color,
          secondary_color: theme[0].secondary_color,
          accent_color: theme[0].accent_color,
        },
        is_active: theme[0].is_active,
      };

      app.logger.info({ id }, 'Theme fetched successfully');
      return formattedTheme;
    } catch (error) {
      app.logger.error({ err: error, id }, 'Failed to fetch theme');
      throw error;
    }
  });

  // POST /api/themes - Create new theme
  fastify.post('/api/themes', async (request, reply) => {
    const body = request.body as {
      theme_name: string;
      background_color: string;
      card_color: string;
      text_color: string;
      text_secondary_color: string;
      primary_color: string;
      secondary_color: string;
      accent_color: string;
    };

    app.logger.info({ body }, 'Creating new theme');
    try {
      const theme = await app.db
        .insert(visualThemes)
        .values({
          theme_name: body.theme_name,
          background_color: body.background_color,
          card_color: body.card_color,
          text_color: body.text_color,
          text_secondary_color: body.text_secondary_color,
          primary_color: body.primary_color,
          secondary_color: body.secondary_color,
          accent_color: body.accent_color,
        })
        .returning();

      const formattedTheme = {
        id: theme[0].id,
        theme_name: theme[0].theme_name,
        colors: {
          background_color: theme[0].background_color,
          card_color: theme[0].card_color,
          text_color: theme[0].text_color,
          text_secondary_color: theme[0].text_secondary_color,
          primary_color: theme[0].primary_color,
          secondary_color: theme[0].secondary_color,
          accent_color: theme[0].accent_color,
        },
        is_active: theme[0].is_active,
      };

      app.logger.info({ themeId: theme[0].id }, 'Theme created successfully');
      return formattedTheme;
    } catch (error) {
      app.logger.error({ err: error, body }, 'Failed to create theme');
      throw error;
    }
  });
}
