CREATE TABLE "renewal_visuals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visual_type" text NOT NULL,
	"day_of_week" integer,
	"month" integer,
	"season" text,
	"image_url" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_renewal_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"item_type" text NOT NULL,
	"item_id" uuid NOT NULL,
	"is_paused" boolean DEFAULT false,
	"saved_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"subscription_tier" text DEFAULT 'free' NOT NULL,
	"is_active" boolean DEFAULT false,
	"started_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
