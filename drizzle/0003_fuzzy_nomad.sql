ALTER TABLE "events" ALTER COLUMN "age_restriction" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."age_restriction";--> statement-breakpoint
CREATE TYPE "public"."age_restriction" AS ENUM('All ages', '18+', '21+', 'Some parts 21+', 'PG-13');--> statement-breakpoint
UPDATE "events" SET "age_restriction" = 'All ages' WHERE "age_restriction" = 'all ages';--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "age_restriction" SET DATA TYPE "public"."age_restriction" USING "age_restriction"::"public"."age_restriction";