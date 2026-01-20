import { pgTable, text, timestamp, uuid, integer, date, boolean, foreignKey } from 'drizzle-orm/pg-core';

// Journal entries table
export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  mood: text('mood'),
  energy: integer('energy'),
  intention: text('intention'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Nutrition logs table
export const nutritionLogs = pgTable('nutrition_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date').notNull(),
  meal_type: text('meal_type').notNull(), // breakfast, lunch, dinner, snack
  food_name: text('food_name').notNull(),
  calories: integer('calories').notNull(),
  protein: integer('protein'),
  carbs: integer('carbs'),
  fats: integer('fats'),
  notes: text('notes'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Workouts table
export const workouts = pgTable('workouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date').notNull(),
  workout_type: text('workout_type').notNull(), // strength, cardio, flexibility, sports
  title: text('title').notNull(),
  duration_minutes: integer('duration_minutes').notNull(),
  calories_burned: integer('calories_burned'),
  notes: text('notes'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Workout exercises table
export const workoutExercises = pgTable('workout_exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  workout_id: uuid('workout_id').notNull().references(() => workouts.id),
  exercise_name: text('exercise_name').notNull(),
  sets: integer('sets'),
  reps: integer('reps'),
  weight: integer('weight'),
  duration_seconds: integer('duration_seconds'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Meditation sessions table
export const meditationSessions = pgTable('meditation_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date').notNull(),
  practice_type: text('practice_type').notNull(), // breathwork, mindfulness, body_scan, loving_kindness, gratitude
  duration_minutes: integer('duration_minutes').notNull(),
  mood_before: text('mood_before'),
  mood_after: text('mood_after'),
  notes: text('notes'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Activities table
export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date').notNull(),
  activity_type: text('activity_type').notNull(), // steps, sleep, water, mood_check
  value: integer('value').notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Wellness goals table
export const wellnessGoals = pgTable('wellness_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  goal_type: text('goal_type').notNull(), // daily_calories, daily_protein, weekly_workouts, daily_meditation, daily_steps, daily_water, daily_sleep
  target_value: integer('target_value').notNull(),
  current_streak: integer('current_streak').default(0),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});
