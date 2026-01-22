import type { FastifyInstance } from 'fastify';
import * as schema from '../db/schema.js';
import { eq } from 'drizzle-orm';
import type { App } from '../index.js';

export function register(app: App, fastify: FastifyInstance) {
  // GET user subscription status
  fastify.get('/api/subscriptions/status', async (request, reply) => {
    app.logger.info({ path: '/api/subscriptions/status', method: 'GET' }, 'Fetching subscription status');

    const requireAuth = app.requireAuth();
    const session = await requireAuth(request, reply);
    if (!session) return;

    try {
      let subscription = await app.db
        .select()
        .from(schema.userSubscriptions)
        .where(eq(schema.userSubscriptions.user_id, session.user.id));

      // If no subscription exists, create a default free tier
      if (subscription.length === 0) {
        const created = await app.db
          .insert(schema.userSubscriptions)
          .values({
            user_id: session.user.id,
            subscription_tier: 'free',
            is_active: false,
          })
          .returning();

        app.logger.info({ userId: session.user.id }, 'Created default free subscription');
        return {
          user_id: created[0].user_id,
          subscription_tier: created[0].subscription_tier,
          is_active: created[0].is_active,
          expires_at: created[0].expires_at,
        };
      }

      // Check if subscription has expired
      if (subscription[0].expires_at && new Date(subscription[0].expires_at) < new Date()) {
        await app.db
          .update(schema.userSubscriptions)
          .set({ is_active: false })
          .where(eq(schema.userSubscriptions.id, subscription[0].id));

        app.logger.info({ userId: session.user.id }, 'Subscription expired');
        subscription = await app.db
          .select()
          .from(schema.userSubscriptions)
          .where(eq(schema.userSubscriptions.user_id, session.user.id));
      }

      app.logger.info(
        { userId: session.user.id, tier: subscription[0].subscription_tier },
        'Successfully fetched subscription status'
      );
      return {
        user_id: subscription[0].user_id,
        subscription_tier: subscription[0].subscription_tier,
        is_active: subscription[0].is_active,
        expires_at: subscription[0].expires_at,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to fetch subscription status');
      throw error;
    }
  });

  // POST activate subscription
  fastify.post('/api/subscriptions/activate', async (request, reply) => {
    const { tier } = request.body as { tier: 'premium' | 'lifetime' };
    app.logger.info({ tier }, 'Activating subscription');

    const requireAuth = app.requireAuth();
    const session = await requireAuth(request, reply);
    if (!session) return;

    try {
      if (!tier || !['premium', 'lifetime'].includes(tier)) {
        app.logger.warn({ tier }, 'Invalid subscription tier');
        return reply.status(400).send({ error: 'Invalid subscription tier' });
      }

      let subscription = await app.db
        .select()
        .from(schema.userSubscriptions)
        .where(eq(schema.userSubscriptions.user_id, session.user.id));

      let updated;
      const now = new Date();
      const expiresAt = tier === 'lifetime' ? null : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days for premium

      if (subscription.length === 0) {
        // Create new subscription
        updated = await app.db
          .insert(schema.userSubscriptions)
          .values({
            user_id: session.user.id,
            subscription_tier: tier,
            is_active: true,
            started_at: now,
            expires_at: expiresAt,
          })
          .returning();

        app.logger.info({ userId: session.user.id, tier }, 'Subscription created');
      } else {
        // Update existing subscription
        updated = await app.db
          .update(schema.userSubscriptions)
          .set({
            subscription_tier: tier,
            is_active: true,
            started_at: now,
            expires_at: expiresAt,
          })
          .where(eq(schema.userSubscriptions.user_id, session.user.id))
          .returning();

        app.logger.info({ userId: session.user.id, tier }, 'Subscription updated');
      }

      return {
        user_id: updated[0].user_id,
        subscription_tier: updated[0].subscription_tier,
        is_active: updated[0].is_active,
        expires_at: updated[0].expires_at,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to activate subscription');
      throw error;
    }
  });
}
