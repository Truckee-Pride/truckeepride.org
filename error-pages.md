# Plan: MVP.4.1 + MVP.4.2 + MVP.4.3 — Error Pages & Empty States

## Context

This is a Next.js 15 App Router project for Truckee Pride, a small LGBTQ+ nonprofit. Read `CLAUDE.md` before starting.

**Key conventions:**

- Tailwind v4, CSS-first config. Custom tokens: `text-brand`, `text-muted`, `text-foreground`, `bg-surface`, `border-border`. Use `cn()` from `clsx`+`tailwind-merge` for class merging.
- `LayoutWidth` from `src/lib/constants.ts`: use `LayoutWidth.wide` (`max-w-2xl mx-auto px-2 sm:px-0`) for page containers.
- `Button` from `src/components/Button.tsx` for any action button or link CTA.
- `TextLink` from `src/components/TextLink.tsx` for inline text links.
- No bare `<button>` or `<a>` tags — use the component catalog.
- No `console.log`, no exposed stack traces.
- Single quotes, no semicolons (Prettier config).

---

## Task 0 — Extract `AddEvent` component (`src/components/AddEvent.tsx`)

The events list page (`src/app/events/page.tsx`) has an inline styled `<Link>` in its header for adding an event. This component extracts it so it can be reused in the empty state (Task 3a) and wherever else an "add event" CTA is needed.

### File to create

`src/components/AddEvent.tsx`

```tsx
import Link from 'next/link'
import { CalendarPlus } from 'lucide-react'

export function AddEvent() {
  return (
    <Link
      href="/events/new"
      className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-inverse no-underline transition-colors hover:bg-brand-hover"
    >
      <CalendarPlus size={16} />
      Submit an Event
    </Link>
  )
}
```

### Update `src/app/events/page.tsx`

Replace the existing inline `<Link>` button in the page header with `<AddEvent />`:

```tsx
// Remove this import (if it becomes unused after the swap):
// import { CalendarPlus } from 'lucide-react'
// import Link from 'next/link'

// Add:
import { AddEvent } from '@/components/AddEvent'

// Replace the inline <Link ...> block with:
;<AddEvent />
```

The text changes from "Add Event" to "Submit an Event" as part of this refactor.

---

## Task 1 — MVP.4.1: Root error boundary (`src/app/error.tsx`)

### What it does

Catches unexpected runtime errors anywhere in the app (except the root layout). Shows a friendly message. Provides a retry button. Never exposes the error message or stack trace to the user.

### Requirements

- **Must be a Client Component** — Next.js requires `'use client'` on error boundaries.
- Props: `error: Error & { digest?: string }`, `reset: () => void`
- Use `LayoutWidth.wide` container.
- Friendly heading: "Something went wrong"
- Short human message: "We hit an unexpected snag. Try refreshing, or come back in a moment."
- Two actions: a "Try again" button (calls `reset()`), and a "Go home" link (`/`).
- `useEffect` to log the error to console in dev only — `if (process.env.NODE_ENV === 'development') console.error(error)`. This is the one acceptable console.log use.
- Do **not** render `error.message` or `error.stack` in the UI.

### File to create

`src/app/error.tsx`

### Example shape

```tsx
'use client'

import { useEffect } from 'react'
import { LayoutWidth } from '@/lib/constants'
import { Button } from '@/components/Button'
import { TextLink } from '@/components/TextLink'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') console.error(error)
  }, [error])

  return (
    <main className={LayoutWidth.wide}>
      {/* heading, message, reset button, home link */}
    </main>
  )
}
```

---

## Task 2 — MVP.4.2: Root not-found page (`src/app/not-found.tsx`)

### What it does

Renders whenever `notFound()` is called or a route doesn't match. Branded 404 page.

### Requirements

- Server Component (no `'use client'`).
- Set `metadata` export with `title: 'Page Not Found'`.
- Use `LayoutWidth.wide` container.
- Heading: "Page not found"
- Short message: "The page you're looking for doesn't exist or may have moved."
- One CTA: `<Button href="/">Back to home</Button>`

### File to create

`src/app/not-found.tsx`

---

## Task 3 — MVP.4.3: Empty states

### 3a — Events list page (`src/app/events/page.tsx`)

The file already has a minimal empty state. Replace it with something more helpful.

**Current code (lines 35–38):**

```tsx
{upcomingEvents.length === 0 ? (
  <p className="text-muted">No upcoming events — check back soon!</p>
) : (
```

**Replace with:** A proper empty state block with:

- A short message: "No upcoming events right now — check back soon!"
- A secondary line: "Have an event to share with the community?"
- `<AddEvent />` (from Task 0) as the CTA

```tsx
import { AddEvent } from '@/components/AddEvent'

// Empty branch:
;<div className="py-8 text-center">
  <p className="text-muted">No upcoming events right now — check back soon!</p>
  <p className="mt-2 text-muted">Have an event to share with the community?</p>
  <div className="mt-4 flex justify-center">
    <AddEvent />
  </div>
</div>
```

Keep the existing structure (`if/else` wrapping the `<div className="flex flex-col gap-3">` list). Just improve the empty branch.

### 3b — Admin events queue (`src/app/admin/events/page.tsx`)

Currently if `allEvents` is empty, the table renders with an empty `<tbody>` (no visual indication). Add an empty state inside `<tbody>`:

```tsx
{allEvents.length === 0 ? (
  <tr>
    <td colSpan={6} className="px-4 py-12 text-center text-muted">
      {statusFilter === 'pending_review'
        ? 'No events pending review.'
        : statusFilter
          ? `No ${statusFilter.replace('_', ' ')} events.`
          : 'No events yet.'}
    </td>
  </tr>
) : (
  allEvents.map((event) => (...))
)}
```

The `colSpan` must match the number of `<th>` columns — count them in the existing file (currently 6).

### 3c — "No user events" — SKIP

The My Events tab (MVP.2.12) hasn't been built yet. Don't create placeholder UI for it.

---

## Verification steps

After implementing, run:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

All three must pass with no errors or warnings.

Manual checks:

1. `pnpm dev` → `/events` page header should show an "Submit an Event" button with the CalendarPlus icon (same appearance as before, text updated).
2. `pnpm dev` → navigate to a non-existent route (e.g. `/foobar`) → should see the not-found page with a "Back to home" button.
3. In `src/app/events/page.tsx`, temporarily change the DB query to return `[]` (or filter to impossible condition) → events page should show the empty state with the Submit CTA.
4. In `src/app/admin/events/page.tsx`, filter to a status with no events → empty state row should appear instead of empty table.
5. For error.tsx: it's hard to trigger naturally — a quick test is to temporarily `throw new Error('test')` at the top of any page component, verify the error UI renders with no stack trace visible, then revert.

## Done

Delete **MVP.4.1**, **MVP.4.2**, and **MVP.4.3** from `TODOLIST.md` when all verification steps pass.
