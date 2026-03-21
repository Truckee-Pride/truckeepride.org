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
| UI primitives   | shadcn/ui (Radix + Tailwind)    |
| Validation      | Zod                             |
| Package manager | pnpm                            |

---

## Next.js App Router Conventions

- **Server Components are the default.** Only add `"use client"` when you actually need browser APIs, event handlers, or React state. Never use `useEffect` + `useState` to fetch data — use Server Components instead.
- **Server Actions** for all form mutations — no separate API routes for UI-driven data mutations. Every Server Action file must start with `"use server"`.
- **The `forms` skill auto-loads when working on forms.** React 19 has form reset behavior that silently clears user input if inputs aren't wired correctly. The forms skill covers the required patterns.
- **Never use `onSubmit` to intercept a form that calls a server action.** Intercepting with `e.preventDefault()` and then re-triggering submission (via `requestSubmit()` or calling the action directly) breaks Next.js's redirect handling or causes first-click bugs. Instead, wrap the server action in a client function passed to `useActionState` — do validation, image uploads, etc. inside the wrapper, then call the real action at the end. This keeps everything in one action flow so `redirect()` and `isPending` work correctly. See `EventForm.tsx` for the pattern.
- **Function props on `'use client'` components must end in `Action`** (e.g. `onEmailSentAction`). Next.js requires this for any function prop that may be passed from a Server Component — TypeScript error ts(71007) will fire otherwise.
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
- Use middleware (`middleware.ts`) to protect `/events/new`, `/events/*/edit`, and `/admin/*` routes at the edge.

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
- **Named event handlers.** Always use `handleX` functions instead of inline arrow functions for event handlers (e.g. `onClick={handleSave}` not `onClick={() => { ... }}`). This keeps JSX readable and makes handlers easy to find.

### TypeScript

- Enable `strict: true` in `tsconfig.json`. Never disable it.
- Prefer `type` over `interface` for consistency.
- **Never use `any`.** Use `unknown` and narrow it, or define a proper type.
- Infer types from Zod schemas and Drizzle tables (`$inferSelect`, `z.infer`) — see the `data-layer` skill.
- Export types from the place they're defined, not from a central `types.ts` barrel file.

### Accessibility

- Target WCAG 2.1 AA standards.
- All images need meaningful `alt` text.
- Interactive elements must be keyboard-navigable.
- Use semantic HTML (`<nav>`, `<main>`, `<article>`, `<button>`, not divs for everything).
- Color contrast must meet WCAG AA minimum (4.5:1 for text).

### Performance

- Images: use `next/image` everywhere. Never use `<img>`.
- Fonts: system sans-serif for now. Brand fonts loaded via `next/font` in the design system phase.
- Only memoize (`useMemo`/`useCallback`) when you've measured a real performance problem.
- Prefer static generation (`generateStaticParams`) for event detail pages; revalidate on publish/update.

### Testing

- Unit tests: Vitest for Zod schemas and pure utility functions.
- Integration tests: Server Actions against a test DB.
- E2E: Playwright for the critical path (submit event → admin approves → event appears publicly).

---

## shadcn/ui

We use [shadcn/ui](https://ui.shadcn.com) for unstyled, accessible UI primitives (built on Radix). Components are **copied into the repo** at `src/components/ui/` — they're ours to customize.

**Adding a new primitive:**

```bash
npx shadcn@latest add <component>   # e.g. npx shadcn@latest add dropdown-menu
```

This generates a file in `src/components/ui/`. Config lives in `components.json` (new-york style, Lucide icons).

**Rules:**

- **Don't use `src/components/ui/` components directly in pages or features.** Wrap them in a project-level component in `src/components/` (e.g., `Modal.tsx` wraps `dialog.tsx`). This keeps the shadcn/ui files easy to regenerate and update.
- **Add a comment at the top of each `ui/` file** noting it came from shadcn/ui and any customizations made.
- **Keep customizations minimal.** Prefer overriding via className props from the wrapper rather than editing the `ui/` file.

---

## Tailwind CSS Rules

See the `tailwind` skill (auto-loaded for styling tasks) for full conventions. Key rule: use `cn()` for all className composition, design tokens instead of raw colors, and never use `!important`.

---

## Component Library

**Never write bare HTML form elements or buttons.** Always use components from the `components` skill catalog (auto-loaded for UI work). Use `PageHeader` instead of bare `<h1>` at the top of pages. If no existing component fits, ask before creating a new one.

Admin tables must use shared style constants from `src/app/admin/table-styles.ts` — see the `review` checklist rule T7.

---

## Common Commands

Standard commands (`pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm build`) work as expected. These non-obvious commands require the dotenv wrapper:

```bash
pnpm exec dotenv -e .env.local -- npx drizzle-kit generate     # Generate migration from schema changes
pnpm exec dotenv -e .env.local -- npx drizzle-kit migrate      # Apply migrations
pnpm exec dotenv -e .env.local -- npx drizzle-kit studio       # Visual DB browser (localhost:4983)
npx dotenv -e .env.local -- tsx src/scripts/<script>.ts         # Run scripts
```

---

## Project-Specific Notes

- **Volunteer project for a small nonprofit.** Favor maintainability over cleverness. The next maintainer may not be an engineer.
- **Events** are the core feature. When in doubt, optimize for that workflow first.
- **Magic link auth only** — no passwords, no OAuth (for now).
- The site should be **fast on mobile** — many attendees will be on phones at outdoor events.

