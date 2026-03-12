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

| Layer           | Choice                          |
| --------------- | ------------------------------- |
| Framework       | Next.js 15 (App Router)         |
| Language        | TypeScript (strict mode)        |
| Styling         | Tailwind CSS v4                 |
| Database        | Neon PostgreSQL (serverless)    |
| ORM             | Drizzle ORM                     |
| Auth            | Auth.js v5 (magic link / email) |
| Email           | Resend + React Email            |
| File storage    | Vercel Blob                     |
| Validation      | Zod                             |
| Package manager | pnpm                            |

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
  page.tsx                    # Homepage
  events/
    page.tsx                  # Public events list
    new/page.tsx              # Create event (auth required)
    [slug]/page.tsx           # Public event detail
  events/[id]/
    edit/page.tsx             # Edit event (auth + ownership)
  dashboard/
    layout.tsx                # Dashboard shell
    page.tsx                  # My events
  admin/
    layout.tsx                # Admin role guard
    events/page.tsx           # Approval queue
    users/page.tsx
  sign-in/page.tsx
  verify/page.tsx
  api/
    auth/[...nextauth]/route.ts
```

---

## Auth & Authorization

- Auth.js v5 with email magic link (Resend) as the only auth method.
- During early dev, `src/lib/auth-stub.ts` provides a fake admin session — replace with `auth()` in Phase 3.
- Use `auth()` server-side to get the session in Server Components and Server Actions.
- Two roles only: `admin` (full access) and `user` (submit/edit own events).
- Event ownership: creator is `ownerId`. Admins can add additional owners via `event_owners` table. A user can edit an event if they are an admin, the owner, or an additional owner.
- Check permissions in Server Actions, not just in UI. Never trust client-supplied role claims.
- Use middleware (`middleware.ts`) to protect `/dashboard/*`, `/events/new`, `/events/*/edit`, and `/admin/*` routes at the edge.

---

## Error Handling

- Use Next.js `error.tsx` boundaries to catch unexpected errors; show a friendly message without exposing stack traces.
- Distinguish between **user errors** (validation failures — show inline) and **system errors** (DB failures — show toast/error boundary).
- Never `console.log` sensitive data. Never hardcode secrets — use `.env.local` only.
- All Server Actions should return `{ success: true, data }` or `{ success: false, error: string }` — never throw from a Server Action that a form calls.

---

## Code Style

- Prettier for formatting (run on save). Single quotes, no semicolons.
- ESLint with `eslint-config-next`. Fix all warnings before merging.
- No commented-out code in commits. Use git history.
- Write JSDoc only for non-obvious function contracts. If a comment explains _what_ the code does (not _why_), refactor instead.

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

## Project-Specific Notes

- **Volunteer project for a small nonprofit.** Favor maintainability over cleverness. The next maintainer may not be an engineer.
- **Events** are the core feature. When in doubt, optimize for that workflow first.
- **Magic link auth only** — no passwords, no OAuth (for now).
- The site should be **fast on mobile** — many attendees will be on phones at outdoor events.

---

## Reference Docs

Detailed conventions live in `.claude/`. Read the relevant file when working in that area:

| Topic                                                 | File                       |
| ----------------------------------------------------- | -------------------------- |
| TypeScript                                            | `.claude/typescript.md`    |
| Data layer (Drizzle, Neon, migrations, audit logging) | `.claude/data-layer.md`    |
| Forms & Zod validation                                | `.claude/forms.md`         |
| Tailwind / styling                                    | `.claude/tailwind.md`      |
| Component patterns                                    | `.claude/components.md`    |
| Performance                                           | `.claude/performance.md`   |
| Testing                                               | `.claude/testing.md`       |
| Accessibility                                         | `.claude/accessibility.md` |
