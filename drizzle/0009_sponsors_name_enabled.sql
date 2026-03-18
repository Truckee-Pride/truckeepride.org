ALTER TABLE "sponsors" RENAME COLUMN "alt" TO "name";--> statement-breakpoint
ALTER TABLE "sponsors" ADD COLUMN "enabled" boolean DEFAULT true NOT NULL;
