import { createApplication } from "@specific-dev/framework";
import * as schema from './db/schema.js';
import * as journalRoutes from './routes/journal.js';
import * as nutritionRoutes from './routes/nutrition.js';
import * as workoutRoutes from './routes/workouts.js';
import * as meditationRoutes from './routes/meditation.js';
import * as activitiesRoutes from './routes/activities.js';
import * as goalsRoutes from './routes/goals.js';
import * as dashboardRoutes from './routes/dashboard.js';
import * as quotesRoutes from './routes/quotes.js';

// Create application with schema for full database type support
export const app = await createApplication(schema);

// Export App type for use in route files
export type App = typeof app;

// Register all route modules
journalRoutes.register(app, app.fastify);
nutritionRoutes.register(app, app.fastify);
workoutRoutes.register(app, app.fastify);
meditationRoutes.register(app, app.fastify);
activitiesRoutes.register(app, app.fastify);
goalsRoutes.register(app, app.fastify);
dashboardRoutes.register(app, app.fastify);
quotesRoutes.register(app, app.fastify);

await app.run();
app.logger.info('Application running');
