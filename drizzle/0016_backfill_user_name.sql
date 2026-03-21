-- Backfill: compute name from first_name + last_name for existing users
UPDATE "users"
SET "name" = TRIM(COALESCE("first_name", '') || ' ' || COALESCE("last_name", ''))
WHERE "first_name" IS NOT NULL OR "last_name" IS NOT NULL;
