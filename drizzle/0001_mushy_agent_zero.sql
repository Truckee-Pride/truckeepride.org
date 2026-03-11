ALTER TABLE "events" ADD COLUMN "short_description" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "emoji" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "requires_ticket" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "age_restriction" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "dogs_welcome" boolean DEFAULT false NOT NULL;