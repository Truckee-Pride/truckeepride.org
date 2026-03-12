CREATE TYPE "public"."age_restriction" AS ENUM('all ages', '18+', '21+');--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "image_url" TO "flyer_url";--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "age_restriction" SET DATA TYPE "public"."age_restriction" USING (
  CASE lower("age_restriction")
    WHEN 'all ages' THEN 'all ages'
    WHEN '18+' THEN '18+'
    WHEN '21+' THEN '21+'
    ELSE NULL
  END
)::"public"."age_restriction";--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "ticket_url" text;