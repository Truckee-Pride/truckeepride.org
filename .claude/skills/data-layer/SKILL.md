---
name: data-layer
description: Drizzle ORM and Neon PostgreSQL conventions for schema definitions, database queries, columns, indexes, migrations (drizzle-kit generate/migrate), transactions for multi-step mutations, revalidation after mutations, and audit logging. Loaded when adding columns, writing queries, changing schema, creating migrations, or working on Server Actions with database mutations.
user-invocable: false
---

# Data Layer (Drizzle + Neon)

- Schema lives in `src/db/schema/`. One file per domain (e.g., `events.ts`, `users.ts`, `audit.ts`).
- Always write explicit column names; don't rely on Drizzle inference for column naming.
- Use `drizzle-kit generate` → `drizzle-kit migrate` workflow. Never edit migration files manually.
- Wrap multi-step mutations in a transaction. Call `revalidatePath()` or `revalidateTag()` after mutations to invalidate cached pages.
- Prefer `db.query.*` (relational queries) over raw SQL for readability.

## Audit Logging

All mutations to events (create, update, status change, delete) must write an audit log entry in the same transaction:

```ts
{
  ;(action, userId, targetType, targetId, createdAt)
}
```

Simple action log — no field-level diffs. Use Drizzle Studio to investigate details if needed.

## Multi-Branch Migrations

Generating migrations on separate branches causes timestamp conflicts in `drizzle/meta/_journal.json`. When branches merge, a migration with a lower index can have a newer timestamp than a higher-indexed one. Drizzle uses timestamps to decide what's pending and will silently skip out-of-order migrations.

**After rebasing or merging branches that touch migrations, run `/rebase` to fix timestamps.**
