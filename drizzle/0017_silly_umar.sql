CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"signups_enabled" boolean DEFAULT true NOT NULL
);

INSERT INTO "site_settings" ("signups_enabled") VALUES (true);
