# TypeScript Conventions

- Enable `strict: true` in `tsconfig.json`. Never disable it.
- Prefer `type` over `interface` for consistency.
- **Never use `any`.** Use `unknown` and narrow it, or define a proper type.
- Infer types from Zod schemas and Drizzle table definitions rather than duplicating them manually:
  ```ts
  type Event = typeof events.$inferSelect
  type NewEvent = typeof events.$inferInsert
  ```
- Export types from the place they're defined, not from a central `types.ts` barrel file.
