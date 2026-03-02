# CLAUDE.md — Truckee Pride Website

This file guides Claude's behavior when working on the Truckee Pride website. Read it before writing any code.

---

## Project Overview

Truckee Pride is a 501(c)3 nonprofit serving the LGBTQ+ community in Truckee, CA. This is a Next.js 15 web app hosted on Vercel with a Neon PostgreSQL database. The primary feature is an events calendar with user-submitted events and admin approval.

**Repo structure:** Turborepo monorepo with `apps/web` (Next.js) and `packages/db` (Drizzle schema + client).

---

## Philosophy

Write code that is **simple, clear, and easy to delete**. Prefer boring solutions over clever ones. A future volunteer maintainer with intermediate React skills should be able to understand any file in this codebase within a few minutes.

- **Fewer abstractions** over more. Don't create a utility unless it's used 3+ times.
- **Colocate** related code. A route's server action, schema, and component can live together.
- **Explicit over implicit.** Name things clearly. Avoid magic.
- **Small PRs.** Make targeted changes; don't refactor unrelated code while fixing a bug.

---

## Tech Stack

Always use the **latest stable versions** of all packages. Do not hardcode specific version numbers in `package.json` — use `"latest"` for frequently-updated packages like Drizzle, or caret ranges (`"^15"`) for major frameworks. Run `pnpm update` regularly.

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Database | Neon PostgreSQL (serverless) |
| ORM | Drizzle ORM |
| Auth | Auth.js v5 (magic link / email) |
| Email | Resend + React Email |
| File storage | Vercel Blob |
| Validation | Zod |
| Monorepo | Turborepo + pnpm |

---

## TypeScript

- Enable `strict: true` in `tsconfig.json`. Never disable it.
- Prefer `type` over `interface` for consistency.
- **Never use `any`.** Use `unknown` and narrow it, or define a proper type.
- Infer types from Zod schemas and Drizzle table definitions rather than duplicating them manually:
  ```ts
  type Event = typeof events.$inferSelect;
  type NewEvent = typeof events.$inferInsert;
  ```
- Export types from the place they're defined, not from a central `types.ts` barrel file.

---

## Next.js App Router Conventions

- **Server Components are the default.** Only add `"use client"` when you actually need browser APIs, event handlers, or React state.
- **Server Actions** for all form mutations. No separate API routes for UI-driven data mutations.
- **Route handlers** (`route.ts`) only for external integrations (webhooks, RSS, etc.).
- Keep Server Components as thin data-fetching shells; pass data down to smaller Client Components for interactivity.
- Use `loading.tsx` and `error.tsx` at the route segment level rather than inline loading states.
- Fetch data as close to where it's used as possible; don't prop-drill fetched data through many layers.

### File naming
```
app/
  (public)/           # Public-facing routes (no auth required)
    events/
      page.tsx
      [slug]/
        page.tsx
  (admin)/            # Admin-only routes
    dashboard/
      page.tsx
    events/
      [id]/
        edit/
          page.tsx
  api/
    auth/[...nextauth]/route.ts
    webhooks/...
```

---

## Data Layer (Drizzle + Neon)

- Schema lives in `packages/db/src/schema/`. One file per domain (e.g., `events.ts`, `users.ts`, `audit.ts`).
- Always write explicit column names; don't rely on Drizzle inference for column naming.
- Use `drizzle-kit generate` → `drizzle-kit migrate` workflow. Never edit migration files manually.
- Wrap multi-step mutations in a transaction.
- Prefer `db.query.*` (relational queries) over raw SQL for readability.

---

## Forms & Validation

- Use **Zod** for all input validation — both client-side (for fast feedback) and server-side (for security).
- Define Zod schemas in a colocated `schema.ts` next to the form they validate.
- Use React's `useActionState` (Next.js 15) with Server Actions for form handling — no client-side `fetch` for mutations.
- Return structured errors from Server Actions; display them inline next to the relevant field.

---

## Styling (Tailwind v4)

- Use Tailwind utility classes directly. Don't create CSS files except for global base styles.
- Use CSS variables for design tokens (colors, fonts, spacing scale) in `globals.css`.
- **Design system tokens** (Truckee Pride brand):
  - Display font: `Fraunces` (variable)
  - Body font: `Nunito Sans`
  - Accent/mono: `IBM Plex Mono`
- Avoid arbitrary Tailwind values (`[42px]`) — extend the theme in `tailwind.config.ts` if a value is needed repeatedly.
- Keep component class lists readable. If a single element has more than ~8 utility classes, extract to a component.

---

## Component Guidelines

- One component per file. Filename = component name (PascalCase).
- Default exports for page components and layouts. Named exports for everything else.
- Co-locate a component's types, helpers, and sub-components in the same file if they're only used there.
- Prefer composition over configuration: instead of a component with 10 boolean props, break it into smaller focused components.
- Use `children` props generously for layout components — don't hardcode content in layout shells.

---

## Auth & Authorization

- Auth.js v5 with email magic link (Resend) as the only auth method.
- Use `auth()` server-side to get the session in Server Components and Server Actions.
- Define roles: `admin`, `moderator` (event owners), `user`.
- Check permissions in Server Actions, not just in UI. Never trust client-supplied role claims.
- Use middleware (`middleware.ts`) to protect `/admin/*` routes at the edge.

---

## Audit Logging

All mutations to events (create, update, status change, delete) must write an audit log entry:
```ts
{ userId, action, entityType, entityId, diff, createdAt }
```
Write the audit entry in the same transaction as the mutation.

---

## Error Handling

- Use Next.js `error.tsx` boundaries to catch unexpected errors; show a friendly message without exposing stack traces.
- Distinguish between **user errors** (validation failures — show inline) and **system errors** (DB failures — show toast/error boundary).
- Never `console.log` sensitive data. Use structured logging with log levels.
- All Server Actions should return `{ success: true, data }` or `{ success: false, error: string }` — never throw from a Server Action that a form calls.

---

## Performance

- Images: use `next/image` everywhere. Never use `<img>`.
- Fonts: load via `next/font` — this project uses `Fraunces`, `Nunito_Sans`, and `IBM_Plex_Mono`.
- Don't over-memoize. Only use `useMemo`/`useCallback` when you can measure a real performance problem.
- Prefer static generation (`generateStaticParams`) for event detail pages; revalidate on publish/update.

---

## Testing (aspirational — add as coverage grows)

- Unit tests for Zod schemas and pure utility functions (Vitest).
- Integration tests for Server Actions against a test DB.
- E2E tests (Playwright) for the critical path: submit event → admin approves → event appears publicly.

---

## Code Style

- Prettier for formatting (run on save). Single quotes, no semicolons (configure to team preference — just be consistent).
- ESLint with `eslint-config-next`. Fix all warnings before merging.
- No commented-out code in commits. Use git history.
- Write JSDoc only for non-obvious function contracts — don't narrate obvious code.
- Keep functions short. If a function needs a comment to explain *what* it does (not *why*), it should be broken up or renamed.

---

## Common Commands

```bash
# Development
turbo dev                    # All apps
turbo dev --filter=web       # Web only

# Database
npx drizzle-kit generate     # Generate migration from schema changes
npx drizzle-kit migrate      # Apply migrations
npx drizzle-kit studio       # Visual DB browser (localhost:4983)

# Checks
turbo lint
turbo typecheck
turbo build

# Package management
pnpm add <pkg> --filter=web            # Add to web app
pnpm add <pkg> --filter=@truckee/db    # Add to db package
pnpm add -D <pkg> -w                   # Add dev dep to workspace root
pnpm update --recursive --latest       # Update all deps to latest
```

---

## Things to Never Do

- ❌ Don't use `any` in TypeScript
- ❌ Don't put secrets in code or `.env.example` — use `.env.local` and document the variable names only
- ❌ Don't use `<img>` — use `next/image`
- ❌ Don't write raw SQL — use Drizzle
- ❌ Don't fetch data in Client Components when a Server Component would work
- ❌ Don't create API routes for UI mutations — use Server Actions
- ❌ Don't hardcode version numbers in `package.json` — use latest/caret ranges
- ❌ Don't create abstractions preemptively — wait until you have real duplication

---

## Accessibility

This is a community nonprofit site. Accessibility is not optional.
- All images need meaningful `alt` text.
- Interactive elements must be keyboard-navigable.
- Use semantic HTML (`<nav>`, `<main>`, `<article>`, `<button>`, not divs for everything).
- Color contrast must meet WCAG AA minimum (4.5:1 for text).
- Test with VoiceOver or NVDA occasionally.

---

## Project-Specific Notes

- **This is a volunteer project for a small nonprofit.** Favor maintainability over cleverness. The next maintainer may not be an engineer.
- **Events** are the core feature. When in doubt, optimize for that workflow first.
- **Magic link auth only** — no passwords, no OAuth (for now). Keep it simple.
- The site should be **fast on mobile** — many attendees will be on phones at outdoor events.
