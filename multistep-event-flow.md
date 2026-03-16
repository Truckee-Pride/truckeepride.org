# Multi-Step Event Submission Flow

> Full spec for MVP.2.12. Depends on MVP.2.1–2.7 (Auth.js infrastructure) being complete.

---

## User Flow

1. **Unauthenticated user visits `/events/new`** → sees event form + account creation fields
2. **Submits** → user record created, event saved as draft, magic link email sent → redirect to `/verify?email=...&event=...`
3. **Verify page** → "Check your email" with resend option and event-aware messaging
4. **Clicks magic link** → authenticated, redirected to `/events/[slug]/confirm`
5. **Confirmation page** → preview of event + "Submit for Review" button → transitions draft → pending_review → redirect to event detail page
6. **Logged-in users** at `/events/new` → current flow unchanged (no account fields, direct submit for review)

---

## DB Migration: User Profile Columns

**File: `src/db/schema/users.ts`**

Add three nullable columns to the `users` table:

```
firstName: text('first_name')   — nullable (existing users won't have it)
lastName: text('last_name')     — nullable
phone: text('phone')            — nullable
```

Update `User` and `NewUser` types (auto-inferred from schema).

Run: `npx drizzle-kit generate && npx drizzle-kit migrate`

---

## Gravatar Utility

**File: `src/lib/gravatar.ts`** (new)

```ts
import { createHash } from 'crypto'

export function getGravatarUrl(email: string, size = 200): string {
  const hash = createHash('md5')
    .update(email.trim().toLowerCase())
    .digest('hex')
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=404`
}
```

`d=404` returns a 404 if no Gravatar exists — client can detect and show nothing.

---

## Account Fields Schema

**File: `src/lib/schemas/account.ts`** (new)

```ts
import { z } from 'zod'

export const accountFieldsSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Phone number is required').max(20),
  profileImage: z.string().url().optional().or(z.literal('')),
})

export type AccountFieldsInput = z.infer<typeof accountFieldsSchema>
```

---

## EventForm Changes

**File: `src/components/events/EventForm.tsx`** (modify)

### New prop

Add `user: User | null` prop. When `user` is null, render the account creation section.

### Account creation section (shown when `user` is null)

Rendered after the event fields, before the submit button:

- `Input` for firstName (required)
- `Input` for lastName (required)
- `Input` for email (required, type="email")
- `Input` for phone (required, type="tel")
- Gravatar preview: debounce email input (~500ms), check if `getGravatarUrl(email)` returns 200. If yes, show as static preview image ("We found your Gravatar"). If not, show nothing.
- `ImageUpload` for profile photo. When Gravatar exists, pass its URL as `existingUrl`. User can upload a different photo to override.

### Dual action

```tsx
const action = user ? createEvent : createEventWithAccount
```

### Button text

- Logged in: "Submit for Review"
- Not logged in: "Create Account & Submit Event"

### Client-side validation

When `user` is null, validate both `createEventSchema` and `accountFieldsSchema`. Merge errors from both.

---

## Event Creation Page

**File: `src/app/events/new/page.tsx`** (modify)

```tsx
export default async function NewEventPage() {
  const user = await getCurrentUser()   // returns User | null
  return (
    <main className={LayoutWidth.wide}>
      <PageHeader ... />
      <EventForm user={user} />
    </main>
  )
}
```

---

## New Server Action: `createEventWithAccount`

**File: `src/app/events/new/actions.ts`** (modify — add new action)

```
createEventWithAccount(prevState, formData):
  1. Parse + validate event fields with createEventSchema
  2. Parse + validate account fields with accountFieldsSchema
  3. Return field errors from either if validation fails
  4. Find or create user by email:
     - If user exists: update firstName/lastName/phone/image where currently null
     - If new: insert with all fields, role='user'
  5. Rate limit check (checkPendingEventLimit)
  6. Create event as DRAFT (NOT pending_review — that happens on confirm page)
  7. Audit log (action: 'create')
  8. Trigger magic link: signIn('resend', {
       email,
       redirect: false,
       redirectTo: `/events/${slug}/confirm`
     })
  9. redirect(`/verify?email=${email}&event=${slug}`)
```

The existing `createEvent` action is **unchanged** — logged-in users keep current behavior (create → auto-submit for review → redirect to event page).

---

## EventPreview Component

**File: `src/components/events/EventPreview.tsx`** (new)

Extract the event rendering from `src/app/events/[slug]/page.tsx` into a shared presentational component. Takes an `Event` and renders:

- Title (with emoji)
- Info block (date/time, location, age restriction, dogs welcome, ticket link)
- Description (markdown)
- Flyer image

Both the event detail page and confirmation page use this component. The detail page adds action buttons (edit, add to calendar) and JSON-LD on top.

---

## Confirmation Page

**File: `src/app/events/[slug]/confirm/page.tsx`** (new)

Server Component:

```
1. const user = await requireUser()   // redirects to /sign-in if not authed
2. Load event by slug
3. Guard: user must own event, event must be in 'draft' status
4. If event is not draft, redirect to /events/[slug]
5. Render:
   - Success banner: "Your event was saved! Review it below, then submit for approval."
   - EventPreview component
   - "Submit for Review" button (form action → confirmAndSubmit)
   - "Edit Event" link → /events/[slug]/edit
```

**File: `src/app/events/[slug]/confirm/actions.ts`** (new)

```ts
confirmAndSubmit(eventId):
  1. const user = await requireUser()
  2. Load event, verify user owns it
  3. Verify event.status === 'draft'
  4. Call existing submitEventForReview(event.id, user.id)
  5. redirect(`/events/${event.slug}`)
```

Reuses the existing `submitEventForReview` function from `src/app/events/new/actions.ts`.

---

## Edge Cases

**Email already exists in DB:** Find existing user, update null profile fields (don't overwrite existing data), create draft event, send magic link. User authenticates as their existing account.

**User doesn't verify email:** Event stays as `draft` indefinitely. Drafts are invisible to the public. Future cleanup job can handle stale drafts (out of scope).

**Rate limiting:** Checked against the found/created user's ID. Prevents spam — each user limited to 3 pending events (new users) or 10 (trusted users).

**Logged-in user navigates to confirm page:** Works if they own the event and it's still a draft. Otherwise redirects to event detail page or shows 404.

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/db/schema/users.ts` | Modify | Add firstName, lastName, phone |
| `src/lib/gravatar.ts` | Create | Gravatar URL helper |
| `src/lib/schemas/account.ts` | Create | Zod schema for account fields |
| `src/app/events/new/page.tsx` | Modify | Pass `user` to EventForm |
| `src/components/events/EventForm.tsx` | Modify | Conditional account fields, Gravatar, dual actions |
| `src/app/events/new/actions.ts` | Modify | Add `createEventWithAccount` |
| `src/components/events/EventPreview.tsx` | Create | Shared event preview component |
| `src/app/events/[slug]/confirm/page.tsx` | Create | Confirmation/preview page |
| `src/app/events/[slug]/confirm/actions.ts` | Create | `confirmAndSubmit` action |
| `src/app/events/[slug]/page.tsx` | Modify | Use EventPreview component |

---

## Verification

1. `pnpm typecheck` passes
2. `pnpm lint` passes
3. `pnpm build` succeeds
4. Manual test (unauthenticated): `/events/new` → fill event + account fields → submit → verify page → click magic link → confirmation page → "Submit for Review" → event detail page with "pending review" banner
5. Manual test (authenticated): `/events/new` → fill event fields only → submit → redirects to event detail page (current behavior unchanged)
