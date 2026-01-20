import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { userPreferences, visualThemes } from '../db/schema.js';
import type { App } from '../index.js';

const DEFAULT_USER_ID = 'default_user';

// Helper function to get theme for current time of day
function getThemeForTimeOfDay(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    // Morning: Energizing Dawn
    return 'Energizing Dawn';
  } else if (hour >= 12 && hour < 17) {
    // Afternoon: Warm Earth
    return 'Warm Earth';
  } else if (hour >= 17 && hour < 21) {
    // Evening: Deep Grounding
    return 'Deep Grounding';
  } else {
    // Night: Neutral Calm
    return 'Neutral Calm';
  }
}

export function register(app: App, fastify: FastifyInstance) {
  // GET /api/preferences - Returns user preferences
  fastify.get('/api/preferences', async (request, reply) => {
    app.logger.info({}, 'Fetching user preferences');
    try {
      let prefs = await app.db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.user_id, DEFAULT_USER_ID))
        .limit(1);

      // Create default preferences if none exist
      if (prefs.length === 0) {
        app.logger.info({}, 'Creating default user preferences');
        const created = await app.db
          .insert(userPreferences)
          .values({
            user_id: DEFAULT_USER_ID,
            selected_theme_id: null,
            auto_theme_by_time: false,
          })
          .returning();
        prefs = created;
      }

      const pref = prefs[0];

      // Fetch theme details if selected
      let themeDetails = null;
      if (pref.selected_theme_id) {
        const theme = await app.db
          .select()
          .from(visualThemes)
          .where(eq(visualThemes.id, pref.selected_theme_id))
          .limit(1);

        if (theme.length > 0) {
          themeDetails = {
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
          };
        }
      }

      const response = {
        id: pref.id,
        selected_theme_id: pref.selected_theme_id,
        auto_theme_by_time: pref.auto_theme_by_time,
        theme_details: themeDetails,
      };

      app.logger.info({}, 'User preferences fetched successfully');
      return response;
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch preferences');
      throw error;
    }
  });

  // PUT /api/preferences - Update preferences
  fastify.put('/api/preferences', async (request, reply) => {
    const body = request.body as {
      selected_theme_id?: string;
      auto_theme_by_time?: boolean;
    };

    app.logger.info({ body }, 'Updating user preferences');
    try {
      const updateData: any = {
        updated_at: new Date(),
      };

      if (body.selected_theme_id !== undefined) {
        updateData.selected_theme_id = body.selected_theme_id;
      }
      if (body.auto_theme_by_time !== undefined) {
        updateData.auto_theme_by_time = body.auto_theme_by_time;
      }

      const updated = await app.db
        .update(userPreferences)
        .set(updateData)
        .where(eq(userPreferences.user_id, DEFAULT_USER_ID))
        .returning();

      // If no preferences existed, create them
      let prefs = updated;
      if (prefs.length === 0) {
        const created = await app.db
          .insert(userPreferences)
          .values({
            user_id: DEFAULT_USER_ID,
            selected_theme_id: body.selected_theme_id || null,
            auto_theme_by_time: body.auto_theme_by_time || false,
          })
          .returning();
        prefs = created;
      }

      const pref = prefs[0];

      // Fetch theme details if selected
      let themeDetails = null;
      if (pref.selected_theme_id) {
        const theme = await app.db
          .select()
          .from(visualThemes)
          .where(eq(visualThemes.id, pref.selected_theme_id))
          .limit(1);

        if (theme.length > 0) {
          themeDetails = {
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
          };
        }
      }

      const response = {
        id: pref.id,
        selected_theme_id: pref.selected_theme_id,
        auto_theme_by_time: pref.auto_theme_by_time,
        theme_details: themeDetails,
      };

      app.logger.info({}, 'User preferences updated successfully');
      return response;
    } catch (error) {
      app.logger.error({ err: error, body }, 'Failed to update preferences');
      throw error;
    }
  });

  // GET /api/preferences/current-theme - Returns the theme that should be active
  fastify.get('/api/preferences/current-theme', async (request, reply) => {
    app.logger.info({}, 'Fetching current active theme');
    try {
      const prefs = await app.db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.user_id, DEFAULT_USER_ID))
        .limit(1);

      let themeId = null;

      if (prefs.length > 0 && prefs[0].auto_theme_by_time) {
        // Get theme by time of day
        const themeName = getThemeForTimeOfDay();
        const theme = await app.db
          .select()
          .from(visualThemes)
          .where(eq(visualThemes.theme_name, themeName))
          .limit(1);

        if (theme.length > 0) {
          themeId = theme[0].id;
        }
      } else if (prefs.length > 0 && prefs[0].selected_theme_id) {
        // Use selected theme
        themeId = prefs[0].selected_theme_id;
      }

      if (!themeId) {
        // Default to first active theme
        const defaultTheme = await app.db
          .select()
          .from(visualThemes)
          .where(eq(visualThemes.is_active, true))
          .limit(1);

        if (defaultTheme.length === 0) {
          app.logger.warn({}, 'No active theme found');
          return reply.code(404).send({ error: 'No active theme found' });
        }
        themeId = defaultTheme[0].id;
      }

      const theme = await app.db
        .select()
        .from(visualThemes)
        .where(eq(visualThemes.id, themeId))
        .limit(1);

      if (theme.length === 0) {
        app.logger.warn({ themeId }, 'Theme not found');
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
      };

      app.logger.info({ themeId }, 'Current active theme fetched successfully');
      return formattedTheme;
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch current theme');
      throw error;
    }
  });
}
