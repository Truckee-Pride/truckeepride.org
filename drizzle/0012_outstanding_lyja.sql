UPDATE "events" SET "short_description" = '' WHERE "short_description" IS NULL;--> statement-breakpoint
UPDATE "events" SET "emoji" = '📅' WHERE "emoji" IS NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "short_description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "emoji" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "vibe_tags" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sponsors_name_unique" ON "sponsors" USING btree (lower(trim("name")));