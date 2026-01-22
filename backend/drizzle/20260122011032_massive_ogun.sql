CREATE TABLE "program_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"program_id" uuid NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"current_day" integer DEFAULT 1,
	"completed_days" jsonb DEFAULT '[]'::jsonb,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "wellness_programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"duration_days" integer NOT NULL,
	"is_premium" boolean DEFAULT false,
	"daily_activities" jsonb NOT NULL,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "program_enrollments" ADD CONSTRAINT "program_enrollments_program_id_wellness_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."wellness_programs"("id") ON DELETE no action ON UPDATE no action;