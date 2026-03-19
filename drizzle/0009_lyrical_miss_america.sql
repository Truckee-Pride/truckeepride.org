-- Backfill null emoji with rainbow flag
UPDATE "events" SET "emoji" = '🏳️‍🌈' WHERE "emoji" IS NULL;--> statement-breakpoint

-- Backfill null short_description with first ~50 chars of description on word boundary
UPDATE "events" SET "short_description" =
  CASE
    WHEN length("description") <= 50 THEN "description"
    ELSE rtrim(regexp_replace(left("description", 50), '\S+$', '')) || '…'
  END
WHERE "short_description" IS NULL;--> statement-breakpoint

ALTER TABLE "events" ALTER COLUMN "short_description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "emoji" SET NOT NULL;
