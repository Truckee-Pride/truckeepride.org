ALTER TABLE "events" ALTER COLUMN "short_description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "emoji" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "vibe_tags" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "sponsors_name_unique" ON "sponsors" USING btree (lower(trim("name")));