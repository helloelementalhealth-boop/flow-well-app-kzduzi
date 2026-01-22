import type { FastifyInstance } from 'fastify';
import * as schema from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import type { App } from '../index.js';

export function register(app: App, fastify: FastifyInstance) {
  // GET user's saved renewal items
  fastify.get('/api/renewal/saved-items', async (request, reply) => {
    app.logger.info({ path: '/api/renewal/saved-items', method: 'GET' }, 'Fetching saved renewal items');

    const requireAuth = app.requireAuth();
    const session = await requireAuth(request, reply);
    if (!session) return;

    try {
      const items = await app.db
        .select()
        .from(schema.savedRenewalItems)
        .where(eq(schema.savedRenewalItems.user_id, session.user.id));

      app.logger.info({ userId: session.user.id, count: items.length }, 'Successfully fetched saved items');
      return items.map((item) => ({
        id: item.id,
        item_type: item.item_type,
        item_id: item.item_id,
        is_paused: item.is_paused,
        saved_at: item.saved_at,
      }));
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to fetch saved renewal items');
      throw error;
    }
  });

  // POST save a renewal item
  fastify.post('/api/renewal/saved-items', async (request, reply) => {
    const { item_type, item_id } = request.body as { item_type: string; item_id: string };
    app.logger.info({ item_type, item_id }, 'Saving renewal item');

    const requireAuth = app.requireAuth();
    const session = await requireAuth(request, reply);
    if (!session) return;

    try {
      if (!['program', 'ritual', 'tool'].includes(item_type)) {
        app.logger.warn({ item_type }, 'Invalid item type');
        return reply.status(400).send({ error: 'Invalid item type' });
      }

      // Check if already saved
      const existing = await app.db
        .select()
        .from(schema.savedRenewalItems)
        .where(
          and(
            eq(schema.savedRenewalItems.user_id, session.user.id),
            eq(schema.savedRenewalItems.item_id, item_id)
          )
        );

      if (existing.length > 0) {
        app.logger.warn({ userId: session.user.id, item_id }, 'Item already saved');
        return reply.status(400).send({ error: 'Item already saved' });
      }

      // Save the item
      const saved = await app.db
        .insert(schema.savedRenewalItems)
        .values({
          user_id: session.user.id,
          item_type,
          item_id,
          is_paused: false,
        })
        .returning();

      app.logger.info({ userId: session.user.id, savedItemId: saved[0].id, item_type, item_id }, 'Item saved successfully');
      return {
        id: saved[0].id,
        item_type: saved[0].item_type,
        item_id: saved[0].item_id,
        is_paused: saved[0].is_paused,
        saved_at: saved[0].saved_at,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id, item_type, item_id }, 'Failed to save renewal item');
      throw error;
    }
  });

  // PUT pause/resume a saved item
  fastify.put('/api/renewal/saved-items/:id/pause', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { is_paused } = request.body as { is_paused: boolean };
    app.logger.info({ savedItemId: id, is_paused }, 'Updating saved item pause status');

    const requireAuth = app.requireAuth();
    const session = await requireAuth(request, reply);
    if (!session) return;

    try {
      // Verify ownership
      const item = await app.db
        .select()
        .from(schema.savedRenewalItems)
        .where(eq(schema.savedRenewalItems.id, id));

      if (item.length === 0) {
        app.logger.warn({ savedItemId: id }, 'Saved item not found');
        return reply.status(404).send({ error: 'Saved item not found' });
      }

      if (item[0].user_id !== session.user.id) {
        app.logger.warn({ userId: session.user.id, savedItemId: id }, 'User not authorized to update item');
        return reply.status(403).send({ error: 'Unauthorized' });
      }

      // Update pause status
      const updated = await app.db
        .update(schema.savedRenewalItems)
        .set({ is_paused })
        .where(eq(schema.savedRenewalItems.id, id))
        .returning();

      app.logger.info({ savedItemId: id, is_paused }, 'Pause status updated successfully');
      return {
        id: updated[0].id,
        item_type: updated[0].item_type,
        item_id: updated[0].item_id,
        is_paused: updated[0].is_paused,
        saved_at: updated[0].saved_at,
      };
    } catch (error) {
      app.logger.error({ err: error, savedItemId: id }, 'Failed to update pause status');
      throw error;
    }
  });

  // DELETE remove a saved item
  fastify.delete('/api/renewal/saved-items/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    app.logger.info({ savedItemId: id }, 'Deleting saved renewal item');

    const requireAuth = app.requireAuth();
    const session = await requireAuth(request, reply);
    if (!session) return;

    try {
      // Verify ownership
      const item = await app.db
        .select()
        .from(schema.savedRenewalItems)
        .where(eq(schema.savedRenewalItems.id, id));

      if (item.length === 0) {
        app.logger.warn({ savedItemId: id }, 'Saved item not found');
        return reply.status(404).send({ error: 'Saved item not found' });
      }

      if (item[0].user_id !== session.user.id) {
        app.logger.warn({ userId: session.user.id, savedItemId: id }, 'User not authorized to delete item');
        return reply.status(403).send({ error: 'Unauthorized' });
      }

      // Delete the item
      const deleted = await app.db
        .delete(schema.savedRenewalItems)
        .where(eq(schema.savedRenewalItems.id, id))
        .returning();

      app.logger.info({ savedItemId: id, userId: session.user.id }, 'Saved item deleted successfully');
      return { success: true, id };
    } catch (error) {
      app.logger.error({ err: error, savedItemId: id }, 'Failed to delete saved renewal item');
      throw error;
    }
  });
}
