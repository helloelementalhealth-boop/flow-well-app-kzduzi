import type { FastifyInstance } from 'fastify';
import * as schema from '../db/schema.js';
import { eq } from 'drizzle-orm';
import type { App } from '../index.js';

export function register(app: App, fastify: FastifyInstance) {
  // GET all wellness programs
  fastify.get('/api/wellness/programs', async (request, reply) => {
    app.logger.info({ path: '/api/wellness/programs', method: 'GET' }, 'Fetching all wellness programs');
    try {
      const programs = await app.db
        .select({
          id: schema.wellnessPrograms.id,
          program_type: schema.wellnessPrograms.program_type,
          title: schema.wellnessPrograms.title,
          description: schema.wellnessPrograms.description,
          duration_days: schema.wellnessPrograms.duration_days,
          is_premium: schema.wellnessPrograms.is_premium,
          image_url: schema.wellnessPrograms.image_url,
          created_at: schema.wellnessPrograms.created_at,
        })
        .from(schema.wellnessPrograms);

      app.logger.info({ count: programs.length }, 'Successfully fetched wellness programs');
      return programs;
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch wellness programs');
      throw error;
    }
  });

  // GET single wellness program with full details
  fastify.get('/api/wellness/programs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    app.logger.info({ id }, 'Fetching wellness program details');
    try {
      const program = await app.db
        .select()
        .from(schema.wellnessPrograms)
        .where(eq(schema.wellnessPrograms.id, id));

      if (program.length === 0) {
        app.logger.warn({ id }, 'Wellness program not found');
        return reply.status(404).send({ error: 'Program not found' });
      }

      app.logger.info({ id, title: program[0].title }, 'Successfully fetched program details');
      return program[0];
    } catch (error) {
      app.logger.error({ err: error, id }, 'Failed to fetch wellness program');
      throw error;
    }
  });

  // POST create new wellness program (admin only)
  fastify.post('/api/wellness/programs', async (request, reply) => {
    app.logger.info({ body: request.body }, 'Creating new wellness program');

    const requireAuth = app.requireAuth();
    const session = await requireAuth(request, reply);
    if (!session) return;

    try {
      // Check admin role
      const user = await app.db
        .select()
        .from((app as any).schema.user)
        .where(eq((app as any).schema.user.id, session.user.id));

      const isAdmin = user.length > 0 && user[0].role === 'admin';
      if (!isAdmin) {
        app.logger.warn({ userId: session.user.id }, 'Non-admin user attempted to create wellness program');
        return reply.status(403).send({ error: 'Unauthorized' });
      }

      const {
        program_type,
        title,
        description,
        duration_days,
        is_premium,
        daily_activities,
        image_url,
      } = request.body as {
        program_type: string;
        title: string;
        description: string;
        duration_days: number;
        is_premium: boolean;
        daily_activities: Array<{ day: number; title: string; activity: string }>;
        image_url?: string;
      };

      const createdProgram = await app.db
        .insert(schema.wellnessPrograms)
        .values({
          program_type,
          title,
          description,
          duration_days,
          is_premium,
          daily_activities: JSON.stringify(daily_activities),
          image_url: image_url || null,
        })
        .returning();

      app.logger.info(
        { programId: createdProgram[0].id, title, program_type },
        'Wellness program created successfully'
      );
      return createdProgram[0];
    } catch (error) {
      app.logger.error({ err: error, body: request.body }, 'Failed to create wellness program');
      throw error;
    }
  });

  // PUT update wellness program (admin only)
  fastify.put('/api/wellness/programs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    app.logger.info({ id, body: request.body }, 'Updating wellness program');

    const requireAuth = app.requireAuth();
    const session = await requireAuth(request, reply);
    if (!session) return;

    try {
      // Check admin role
      const user = await app.db
        .select()
        .from((app as any).schema.user)
        .where(eq((app as any).schema.user.id, session.user.id));

      const isAdmin = user.length > 0 && user[0].role === 'admin';
      if (!isAdmin) {
        app.logger.warn({ userId: session.user.id, programId: id }, 'Non-admin user attempted to update program');
        return reply.status(403).send({ error: 'Unauthorized' });
      }

      const body = request.body as any;
      const updateData: any = {};
      if (body.program_type) updateData.program_type = body.program_type;
      if (body.title) updateData.title = body.title;
      if (body.description) updateData.description = body.description;
      if (body.duration_days) updateData.duration_days = body.duration_days;
      if (body.is_premium !== undefined) updateData.is_premium = body.is_premium;
      if (body.daily_activities) updateData.daily_activities = JSON.stringify(body.daily_activities);
      if (body.image_url) updateData.image_url = body.image_url;
      updateData.updated_at = new Date();

      const updated = await app.db
        .update(schema.wellnessPrograms)
        .set(updateData)
        .where(eq(schema.wellnessPrograms.id, id))
        .returning();

      if (updated.length === 0) {
        app.logger.warn({ id }, 'Wellness program not found for update');
        return reply.status(404).send({ error: 'Program not found' });
      }

      app.logger.info({ programId: id }, 'Wellness program updated successfully');
      return updated[0];
    } catch (error) {
      app.logger.error({ err: error, id }, 'Failed to update wellness program');
      throw error;
    }
  });

  // DELETE wellness program (admin only)
  fastify.delete('/api/wellness/programs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    app.logger.info({ id }, 'Deleting wellness program');

    const requireAuth = app.requireAuth();
    const session = await requireAuth(request, reply);
    if (!session) return;

    try {
      // Check admin role
      const user = await app.db
        .select()
        .from((app as any).schema.user)
        .where(eq((app as any).schema.user.id, session.user.id));

      const isAdmin = user.length > 0 && user[0].role === 'admin';
      if (!isAdmin) {
        app.logger.warn({ userId: session.user.id, programId: id }, 'Non-admin user attempted to delete program');
        return reply.status(403).send({ error: 'Unauthorized' });
      }

      // First delete all enrollments for this program
      await app.db
        .delete(schema.programEnrollments)
        .where(eq(schema.programEnrollments.program_id, id));

      // Then delete the program
      const deleted = await app.db
        .delete(schema.wellnessPrograms)
        .where(eq(schema.wellnessPrograms.id, id))
        .returning();

      if (deleted.length === 0) {
        app.logger.warn({ id }, 'Wellness program not found for deletion');
        return reply.status(404).send({ error: 'Program not found' });
      }

      app.logger.info({ programId: id }, 'Wellness program deleted successfully');
      return { success: true, id };
    } catch (error) {
      app.logger.error({ err: error, id }, 'Failed to delete wellness program');
      throw error;
    }
  });
}
