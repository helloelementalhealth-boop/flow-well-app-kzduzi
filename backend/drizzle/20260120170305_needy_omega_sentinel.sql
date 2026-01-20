CREATE TABLE "weekly_quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_text" text NOT NULL,
	"week_start_date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
