import type { FastifyInstance } from 'fastify';
import * as schema from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import type { App } from '../index.js';

export function register(app: App, fastify: FastifyInstance) {
  // GET user's program enrollments
  fastify.get('/api/wellness/enrollments', async (request, reply) => {
    app.logger.info({ path: '/api/wellness/enrollments', method: 'GET' }, 'Fetching user enrollments');

    const requireAuth = app.requireAuth();
    const session = await requireAuth(request, reply);
    if (!session) return;

    try {
      const enrollments = await app.db
        .select({
          id: schema.programEnrollments.id,
          program_id: schema.programEnrollments.program_id,
          enrolled_at: schema.programEnrollments.enrolled_at,
          current_day: schema.programEnrollments.current_day,
          completed_days: schema.programEnrollments.completed_days,
          is_completed: schema.programEnrollments.is_completed,
          completed_at: schema.programEnrollments.completed_at,
          program: {
            id: schema.wellnessPrograms.id,
            title: schema.wellnessPrograms.title,
            description: schema.wellnessPrograms.description,
            duration_days: schema.wellnessPrograms.duration_days,
            is_premium: schema.wellnessPrograms.is_premium,
          },
        })
        .from(schema.programEnrollments)
        .leftJoin(schema.wellnessPrograms, eq(schema.programEnrollments.program_id, schema.wellnessPrograms.id))
        .where(eq(schema.programEnrollments.user_id, session.user.id));

      app.logger.info({ userId: session.user.id, count: enrollments.length }, 'Successfully fetched enrollments');
      return enrollments;
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to fetch enrollments');
      throw error;
    }
  });

  // POST enroll in program
  fastify.post('/api/wellness/enrollments', async (request, reply) => {
    const { program_id } = request.body as { program_id: string };
    app.logger.info({ program_id }, 'User enrolling in wellness program');

    const requireAuth = app.requireAuth();
    const session = await requireAuth(request, reply);
    if (!session) return;

    try {
      // Check if program exists
      const program = await app.db
        .select()
        .from(schema.wellnessPrograms)
        .where(eq(schema.wellnessPrograms.id, program_id));

      if (program.length === 0) {
        app.logger.warn({ program_id }, 'Program not found');
        return reply.status(404).send({ error: 'Program not found' });
      }

      // Check if already enrolled
      const existing = await app.db
        .select()
        .from(schema.programEnrollments)
        .where(
          and(
            eq(schema.programEnrollments.user_id, session.user.id),
            eq(schema.programEnrollments.program_id, program_id)
          )
        );

      if (existing.length > 0) {
        app.logger.warn({ userId: session.user.id, program_id }, 'User already enrolled in program');
        return reply.status(400).send({ error: 'Already enrolled in this program' });
      }

      // Create enrollment
      const enrollment = await app.db
        .insert(schema.programEnrollments)
        .values({
          user_id: session.user.id,
          program_id,
          current_day: 1,
          completed_days: JSON.stringify([]),
          is_completed: false,
        })
        .returning();

      app.logger.info(
        { enrollmentId: enrollment[0].id, userId: session.user.id, program_id },
        'User enrolled successfully'
      );
      return enrollment[0];
    } catch (error) {
      app.logger.error({ err: error, program_id, userId: session.user.id }, 'Failed to enroll in program');
      throw error;
    }
  });

  // PUT update progress (mark day as completed)
  fastify.put('/api/wellness/enrollments/:id/progress', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { day } = request.body as { day: number };
    app.logger.info({ enrollmentId: id, day }, 'Updating enrollment progress');

    const requireAuth = app.requireAuth();
    const session = await requireAuth(request, reply);
    if (!session) return;

    try {
      // Get enrollment and verify ownership
      const enrollment = await app.db
        .select()
        .from(schema.programEnrollments)
        .where(eq(schema.programEnrollments.id, id));

      if (enrollment.length === 0) {
        app.logger.warn({ enrollmentId: id }, 'Enrollment not found');
        return reply.status(404).send({ error: 'Enrollment not found' });
      }

      if (enrollment[0].user_id !== session.user.id) {
        app.logger.warn({ userId: session.user.id, enrollmentId: id }, 'User not authorized to update enrollment');
        return reply.status(403).send({ error: 'Unauthorized' });
      }

      // Parse completed days
      let completedDays = [];
      if (enrollment[0].completed_days) {
        if (typeof enrollment[0].completed_days === 'string') {
          completedDays = JSON.parse(enrollment[0].completed_days);
        } else {
          completedDays = enrollment[0].completed_days as any[];
        }
      }

      // Add day if not already completed
      if (!completedDays.includes(day)) {
        completedDays.push(day);
        completedDays.sort((a, b) => a - b);
      }

      // Get program to check if completed
      const program = await app.db
        .select()
        .from(schema.wellnessPrograms)
        .where(eq(schema.wellnessPrograms.id, enrollment[0].program_id));

      const isCompleted = completedDays.length === program[0].duration_days;

      // Update enrollment
      const updated = await app.db
        .update(schema.programEnrollments)
        .set({
          completed_days: JSON.stringify(completedDays),
          current_day: Math.max(...completedDays) + 1,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date() : null,
        })
        .where(eq(schema.programEnrollments.id, id))
        .returning();

      app.logger.info(
        { enrollmentId: id, completedDays: completedDays.length, isCompleted },
        'Progress updated successfully'
      );
      return updated[0];
    } catch (error) {
      app.logger.error({ err: error, enrollmentId: id }, 'Failed to update progress');
      throw error;
    }
  });

  // DELETE unenroll from program
  fastify.delete('/api/wellness/enrollments/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    app.logger.info({ enrollmentId: id }, 'User unenrolling from program');

    const requireAuth = app.requireAuth();
    const session = await requireAuth(request, reply);
    if (!session) return;

    try {
      // Get enrollment and verify ownership
      const enrollment = await app.db
        .select()
        .from(schema.programEnrollments)
        .where(eq(schema.programEnrollments.id, id));

      if (enrollment.length === 0) {
        app.logger.warn({ enrollmentId: id }, 'Enrollment not found');
        return reply.status(404).send({ error: 'Enrollment not found' });
      }

      if (enrollment[0].user_id !== session.user.id) {
        app.logger.warn({ userId: session.user.id, enrollmentId: id }, 'User not authorized to delete enrollment');
        return reply.status(403).send({ error: 'Unauthorized' });
      }

      // Delete enrollment
      const deleted = await app.db
        .delete(schema.programEnrollments)
        .where(eq(schema.programEnrollments.id, id))
        .returning();

      app.logger.info({ enrollmentId: id, userId: session.user.id }, 'User unenrolled successfully');
      return { success: true, id };
    } catch (error) {
      app.logger.error({ err: error, enrollmentId: id }, 'Failed to unenroll from program');
      throw error;
    }
  });
}
