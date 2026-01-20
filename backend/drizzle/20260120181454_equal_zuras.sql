CREATE TABLE "admin_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_name" text NOT NULL,
	"icon_name" text NOT NULL,
	"route_path" text NOT NULL,
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_categories_category_name_unique" UNIQUE("category_name")
);
--> statement-breakpoint
CREATE TABLE "admin_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_name" text NOT NULL,
	"content_type" text NOT NULL,
	"content_key" text NOT NULL,
	"content_value" text NOT NULL,
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_name" text NOT NULL,
	"plan_description" text,
	"price" text NOT NULL,
	"billing_period" text NOT NULL,
	"features" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
