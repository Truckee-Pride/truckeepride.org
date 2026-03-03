# CLAUDE.md — Truckee Pride Website

This file guides Claude's behavior when working on the Truckee Pride website. Read it before writing any code.

---

## Project Overview

Truckee Pride is a 501(c)3 nonprofit serving the LGBTQ+ community in Truckee, CA. This is a Next.js 15 web app hosted on Vercel with a Neon PostgreSQL database. The primary feature is an events calendar with user-submitted events and admin approval.

**Repo structure:** Plain Next.js app. Schema, validators, and types all live in `src/`. See `ARCHITECTURE.md` for full structure, schema, and access control details. See `TODOLIST.md` for next planned steps, and delete items from TODOLIST when finished implementing (delete the completed task text entirely, don't just mark as complete).

---

## Philosophy

Write code that is **simple, clear, and easy to delete**. Prefer boring solutions over clever ones. A future volunteer maintainer with intermediate React skills should be able to understand any file in this codebase within a few minutes.

- **Fewer abstractions** over more. Don't create a utility unless it's used 3+ times.
- **Colocate** related code. A route's server action, schema, and component can live together.
- **Explicit over implicit.** Name things clearly. Avoid magic.
- **Small PRs.** Make targeted changes; don't refactor unrelated code while fixing a bug.

---

## Tech Stack

Use `"latest"` for frequently-updated packages (Drizzle), caret ranges (`"^15"`) for frameworks. Never hardcode versions. Run `pnpm update` regularly.

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
| Package manager | pnpm |

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

- **Server Components are the default.** Only add `"use client"` when you actually need browser APIs, event handlers, or React state. Never use `useEffect` + `useState` to fetch data — use Server Components instead.
- **Server Actions** for all form mutations — no separate API routes for UI-driven data mutations. Every Server Action file must start with `"use server"`.
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
  (dashboard)/        # Authenticated area
    dashboard/
      page.tsx
    events/
      new/page.tsx
      [id]/edit/page.tsx
    admin/            # Admin-only routes
      events/page.tsx
      users/page.tsx
  (auth)/
    sign-in/page.tsx
    verify/page.tsx
  api/
    auth/[...nextauth]/route.ts
```

---

## Data Layer (Drizzle + Neon)

- Schema lives in `src/db/schema/`. One file per domain (e.g., `events.ts`, `users.ts`, `audit.ts`).
- Always write explicit column names; don't rely on Drizzle inference for column naming.
- Use `drizzle-kit generate` → `drizzle-kit migrate` workflow. Never edit migration files manually.
- Wrap multi-step mutations in a transaction. Call `revalidatePath()` or `revalidateTag()` after mutations to invalidate cached pages.
- Prefer `db.query.*` (relational queries) over raw SQL for readability.

---

## Forms & Validation

- Use **Zod** for all input validation — both client-side (for fast feedback) and server-side (for security).
- Define Zod schemas in a colocated `schema.ts` next to the form they validate.
- Use React's `useActionState` (Next.js 15) with Server Actions for form handling — no client-side `fetch` for mutations.
- Return structured errors from Server Actions; display them inline next to the relevant field.

---

## Styling (Tailwind v4)

- Use Tailwind utility classes directly. Don't create CSS files except for `globals.css`.
- Use CSS variables for design tokens (colors, fonts, spacing scale) in `globals.css`.
- **Placeholder phase** uses system sans-serif. Brand fonts (Fraunces, Nunito Sans, IBM Plex Mono) loaded via `next/font` in the design system phase.
- Tailwind v4 is CSS-first: extend the theme using `@theme` in `globals.css`, not `tailwind.config.ts`.
- **Never use `!important`** (or Tailwind's `!` prefix). If a utility class isn't winning, the base style is in the wrong cascade layer — fix it there, not on the utility side.
- **All custom element styles in `globals.css` must be inside `@layer base { ... }`.** Tailwind v4 uses native CSS cascade layers. Unlayered CSS always beats layered CSS regardless of specificity — so bare `a { color: blue }` will override `text-white` on a link. Wrapping in `@layer base` puts the styles below Tailwind's `utilities` layer, so utility classes win naturally. The only things that should live outside `@layer base` are `:root` variables and `@theme` blocks.
- Avoid arbitrary Tailwind values (`[42px]`). Keep component class lists readable — if a single element has more than ~8 utility classes, extract to a component.

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
- During early dev, `src/lib/auth-stub.ts` provides a fake admin session — replace with `auth()` in Phase 3.
- Use `auth()` server-side to get the session in Server Components and Server Actions.
- Two roles only: `admin` (full access) and `user` (submit/edit own events).
- Event ownership: creator is `ownerId`. Admins can add additional owners via `event_owners` table. A user can edit an event if they are an admin, the owner, or an additional owner.
- Check permissions in Server Actions, not just in UI. Never trust client-supplied role claims.
- Use middleware (`middleware.ts`) to protect `/dashboard/*` and `/admin/*` routes at the edge.

---

## Audit Logging

All mutations to events (create, update, status change, delete) must write an audit log entry in the same transaction:
```ts
{ action, userId, targetType, targetId, createdAt }
```
Simple action log — no field-level diffs. Use Drizzle Studio to investigate details if needed.

---

## Error Handling

- Use Next.js `error.tsx` boundaries to catch unexpected errors; show a friendly message without exposing stack traces.
- Distinguish between **user errors** (validation failures — show inline) and **system errors** (DB failures — show toast/error boundary).
- Never `console.log` sensitive data. Never hardcode secrets — use `.env.local` only.
- All Server Actions should return `{ success: true, data }` or `{ success: false, error: string }` — never throw from a Server Action that a form calls.

---

## Performance

- Images: use `next/image` everywhere. Never use `<img>`.
- Fonts: system sans-serif for now. Brand fonts (`Fraunces`, `Nunito_Sans`, `IBM_Plex_Mono`) loaded via `next/font` in the design system phase.
- Only memoize (`useMemo`/`useCallback`) when you've measured a real performance problem.
- Prefer static generation (`generateStaticParams`) for event detail pages; revalidate on publish/update.

---

## Testing

- Unit tests: Vitest for Zod schemas and pure utility functions.
- Integration tests: Server Actions against a test DB.
- E2E: Playwright for the critical path (submit event → admin approves → event appears publicly).

---

## Code Style

- Prettier for formatting (run on save). Single quotes, no semicolons.
- ESLint with `eslint-config-next`. Fix all warnings before merging.
- No commented-out code in commits. Use git history.
- Write JSDoc only for non-obvious function contracts. If a comment explains *what* the code does (not *why*), refactor instead.

---

## Common Commands

```bash
# Development
pnpm dev                     # Start dev server

# Database
npx drizzle-kit generate     # Generate migration from schema changes
npx drizzle-kit migrate      # Apply migrations
npx drizzle-kit studio       # Visual DB browser (localhost:4983)

# Checks
pnpm lint
pnpm typecheck
pnpm build

# Package management
pnpm add <pkg>               # Add dependency
pnpm add -D <pkg>            # Add dev dependency
pnpm update                  # Update all deps
```

---

## Accessibility

- Target WCAG 2.1 AA standards for accessibility.
- All images need meaningful `alt` text.
- Interactive elements must be keyboard-navigable.
- Use semantic HTML (`<nav>`, `<main>`, `<article>`, `<button>`, not divs for everything).
- Color contrast must meet WCAG AA minimum (4.5:1 for text).

---

## Project-Specific Notes

- **Volunteer project for a small nonprofit.** Favor maintainability over cleverness. The next maintainer may not be an engineer.
- **Events** are the core feature. When in doubt, optimize for that workflow first.
- **Magic link auth only** — no passwords, no OAuth (for now).
- The site should be **fast on mobile** — many attendees will be on phones at outdoor events.
