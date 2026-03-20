---
name: data-layer
description: Drizzle ORM and Neon PostgreSQL conventions. Covers schema organization in src/db/schema/, migration workflow (drizzle-kit generate/migrate), transaction usage for multi-step mutations, revalidation after mutations, and audit logging for event mutations. Loaded when working on database queries, schema changes, Server Actions with mutations, or migrations.
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
