CREATE TABLE "rhythm_visuals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rhythm_category" text NOT NULL,
	"rhythm_name" text NOT NULL,
	"image_url" text NOT NULL,
	"video_url" text,
	"month_active" integer NOT NULL,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT 'default_user',
	"selected_theme_id" uuid,
	"auto_theme_by_time" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visual_themes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"theme_name" text NOT NULL,
	"background_color" text NOT NULL,
	"card_color" text NOT NULL,
	"text_color" text NOT NULL,
	"text_secondary_color" text NOT NULL,
	"primary_color" text NOT NULL,
	"secondary_color" text NOT NULL,
	"accent_color" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_selected_theme_id_visual_themes_id_fk" FOREIGN KEY ("selected_theme_id") REFERENCES "public"."visual_themes"("id") ON DELETE no action ON UPDATE no action;