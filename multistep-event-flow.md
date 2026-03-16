# Multi-Step Event Submission Flow

> Full spec for MVP.2.12. Depends on MVP.2.1–2.7 (Auth.js infrastructure) being complete.

---

## User Flow

### Unauthenticated user

```
Step 1: /events/new
  Fill out event form → click "Next"
  → Event saved as anonymous draft in DB (draftToken cookie set)
  → Redirect to /events/new/account

Step 2: /events/new/account
  Fill out first name, last name, email, phone, optional profile photo
  → If email already exists in DB: skip account creation, just send magic link
  → If email is new: create user record
  → Link draft event to user (set ownerId)
  → Send magic link with redirectTo=/events/[slug]/confirm
  → Redirect to /verify?email=...&event=...

Step 3: /verify
  "Check your email" page with resend option

Step 4: Click magic link in email
  → Authenticated → redirected to /events/[slug]/confirm

Step 5: /events/[slug]/confirm
  Preview of event page + "Submit for Review" button
  → Transitions draft → pending_review
  → Redirect to /events/[slug]
```

### Logged-in user

```
Step 1: /events/new
  Fill out event form → click "Submit for Review"
  → Event created and immediately submitted for review (current behavior)
  → Redirect to /events/[slug]
```

No account step, no confirmation page. Unchanged from current flow.

---

## DB Schema Changes

### 1. User profile columns

**File: `src/db/schema/users.ts`**

Add three nullable columns to the `users` table:

```
firstName: text('first_name')   — nullable (existing users won't have it)
lastName: text('last_name')     — nullable
phone: text('phone')            — nullable
```

Update `User` and `NewUser` types (auto-inferred from schema).

### 2. Anonymous draft support on events table

**File: `src/db/schema/events.ts`**

Currently `ownerId` is `NOT NULL` with a foreign key to `users.id`. Anonymous drafts (step 1, before account creation) have no user yet. Two changes needed:

**Option A (recommended): Make `ownerId` nullable**

```
ownerId: text('owner_id').references(() => users.id)   // remove .notNull()
```

Add a `draftToken` column for claiming anonymous drafts:

```
draftToken: text('draft_token')   — nullable, indexed
```

The `draftToken` is a random UUID generated when an anonymous draft is created. It's stored in an HTTP-only cookie on the client. During step 2 (account creation), the server reads the cookie, finds the draft by token, sets `ownerId`, and clears `draftToken`.

**Why nullable ownerId?** The alternative (a separate `anonymous_drafts` table) duplicates the entire events schema. Nullable ownerId is simpler — anonymous drafts are just events with `ownerId IS NULL` and a `draftToken`. They're invisible to all public queries (which already filter by status).

**Cleanup:** Anonymous drafts with no owner that are older than 7 days can be deleted by a future cron job (out of scope).

### 3. Ensuring drafts persist through the full flow

The draft event row stays in the DB throughout the entire flow:

| Step | Event state |
|------|-------------|
| Step 1: form submit | `status='draft'`, `ownerId=NULL`, `draftToken=<uuid>` |
| Step 2: account creation | `status='draft'`, `ownerId=<user.id>`, `draftToken=NULL` |
| Step 3-4: verify + magic link | No change — event stays as draft |
| Step 5: confirm + submit | `status='pending_review'`, `ownerId=<user.id>` |

The magic link's `redirectTo` URL includes the event slug (`/events/[slug]/confirm`), so Auth.js redirects the user straight to the confirmation page after authentication. The draft is loaded by slug and verified against the authenticated user's ID.

**Important:** The `createEvent` server action (used by logged-in users) continues to set `ownerId` directly — no `draftToken` needed. Only the anonymous flow uses `draftToken`.

### Migration

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

## Step 1: Event Form (Page 1)

### Page

**File: `src/app/events/new/page.tsx`** (modify)

```tsx
export default async function NewEventPage() {
  const user = await getCurrentUser()   // returns User | null
  return (
    <main className={LayoutWidth.wide}>
      <PageHeader
        title="Submit Event"
        subtitle="Fill out the details below. Your event will be reviewed before it goes live."
      />
      <EventForm user={user} />
    </main>
  )
}
```

### EventForm changes

**File: `src/components/events/EventForm.tsx`** (modify)

Add `user: User | null` prop. The form fields stay the same — this page is only the event details.

**Button text and action change based on auth state:**
- Logged in (`user` is present): button says "Submit for Review", action is `createEvent` (current behavior, unchanged)
- Not logged in (`user` is null): button says "Next: Create Account", action is `createAnonymousDraft`

### New server action: `createAnonymousDraft`

**File: `src/app/events/new/actions.ts`** (modify — add new action)

```
createAnonymousDraft(prevState, formData):
  1. Parse + validate event fields with createEventSchema
  2. Return field errors if validation fails
  3. Generate slug (ensureUniqueSlug)
  4. Generate draftToken (crypto.randomUUID())
  5. Insert event with status='draft', ownerId=NULL, draftToken
  6. Set HTTP-only cookie: 'draft_token' = draftToken (SameSite=Lax, path=/, maxAge=7 days)
  7. redirect(`/events/new/account?event=${slug}`)
```

No user record, no auth, no magic link — just save the event and move on.

---

## Step 2: Account Creation (Page 2)

### Page

**File: `src/app/events/new/account/page.tsx`** (new)

Server Component:

```tsx
export default async function AccountPage({ searchParams }) {
  const { event } = await searchParams
  // Load the draft event by slug to show a summary (title, date)
  // Verify draftToken cookie matches the event's draftToken
  // If no match or event not found → redirect to /events/new

  return (
    <main>
      <PageHeader title="Create Your Account" subtitle="Almost done! ..." />
      <p>Your event "{event.title}" has been saved as a draft.</p>
      <AccountForm eventSlug={event.slug} />
    </main>
  )
}
```

### AccountForm component

**File: `src/components/events/AccountForm.tsx`** (new, client component)

Fields:

- `Input` name="firstName", label="First Name", required, `autoComplete="given-name"`
- `Input` name="lastName", label="Last Name", required, `autoComplete="family-name"`
- `Input` name="email", label="Email", required, `type="email"`, `autoComplete="email"`, `inputMode="email"`
- Phone number field (see phone number section below)
- Gravatar preview + `ImageUpload` for profile photo (see Gravatar section below)
- Hidden input: `eventSlug`
- Button: "Create Account & Continue"

### Phone number field

The `Input` component should support phone formatting. Implementation:

```
name="phone"
label="Phone Number"
type="tel"
autoComplete="tel"
inputMode="tel"
```

**Auto-formatting as you type:** Add an `onChange` handler that formats the raw digits into `(xxx) xxx-xxxx` as the user types. Strip non-digit characters on input, then format:
- 0-3 digits: show raw
- 4-6 digits: `(xxx) xxx`
- 7-10 digits: `(xxx) xxx-xxxx`

Store the raw digits (no formatting) in the hidden form value for server-side validation. Display the formatted version in the input.

This can be done inline in the `AccountForm` component — no need for a separate utility since it's used in one place. If the `Input` component doesn't support controlled value easily, use a local state + hidden input pattern.

### Browser autofill attributes

All fields use standard `autoComplete` values so browsers and password managers can autofill:

| Field | `autoComplete` | `type` | `inputMode` |
|-------|---------------|--------|-------------|
| First Name | `given-name` | `text` | (default) |
| Last Name | `family-name` | `text` | (default) |
| Email | `email` | `email` | `email` |
| Phone | `tel` | `tel` | `tel` |

Wrap all fields in a `<form>` with `autoComplete="on"`. Include a hidden `<input type="text" autoComplete="name" />` (visually hidden) so browsers can associate the form with contact autofill.

### Gravatar integration

When the user types their email (debounce ~500ms):
1. Compute the Gravatar URL client-side (MD5 hash — use a lightweight client-side MD5 or fetch from a server endpoint)
2. Fetch the URL with `fetch(gravatarUrl, { mode: 'no-cors' })` or use an `<img>` onLoad/onError handler
3. If image loads: show as preview with "We found your Gravatar" text, pass URL as `existingUrl` to `ImageUpload`
4. If 404: show nothing, `ImageUpload` shows empty state

The user can upload a different photo to override the Gravatar.

**Note:** MD5 in the browser — use a small inline implementation or `crypto.subtle` (which doesn't support MD5). Simplest: call a lightweight server action `getGravatarUrl(email)` that returns the URL, then test it with an `<img>` tag.

### Server action: `createAccountAndClaimDraft`

**File: `src/app/events/new/account/actions.ts`** (new)

```
createAccountAndClaimDraft(prevState, formData):
  1. Parse + validate account fields with accountFieldsSchema
  2. Return field errors if validation fails
  3. Read draftToken from cookie
  4. Load draft event by slug + draftToken (verify they match)
  5. If no match → return error "Draft not found"

  6. Check if user exists by email:

     If email exists in DB:
       → Update firstName/lastName/phone/image where currently null
       → Set event.ownerId = existing user's ID
       → Clear event.draftToken
       → Send magic link: signIn('resend', {
           email, redirect: false,
           redirectTo: `/events/${slug}/confirm`
         })
       → redirect(`/verify?email=${email}&event=${slug}`)

     If email is new:
       → Insert new user (firstName, lastName, email, phone, image, role='user')
       → Set event.ownerId = new user's ID
       → Clear event.draftToken
       → Send magic link (same as above)
       → redirect(`/verify?email=${email}&event=${slug}`)

  7. Clear the draft_token cookie
```

**Key point about existing emails:** When the email already exists, we do NOT create a new account. We link the draft to the existing user, send them a magic link, and let them verify. This handles both "returning user submitting a new event" and "typo'd someone else's email" (they won't be able to verify).

---

## Step 3: Verify Page

Already specified in MVP.2.6. The verify page accepts `?email=...&event=...` and shows event-aware messaging: "Once you verify, you'll review your event before it goes live."

---

## Step 4: Magic Link → Confirmation

Auth.js handles this automatically. The `redirectTo` was set to `/events/[slug]/confirm` when calling `signIn()`. After the user clicks the magic link and is authenticated, Auth.js redirects them to the confirmation page.

---

## Step 5: Confirmation Page

### EventPreview component

**File: `src/components/events/EventPreview.tsx`** (new)

Extract the event rendering from `src/app/events/[slug]/page.tsx` into a shared presentational component. Takes an `Event` and renders:

- Title (with emoji)
- Info block (date/time, location, age restriction, dogs welcome, ticket link)
- Description (markdown)
- Flyer image

Both the event detail page and confirmation page use this component. The detail page adds action buttons (edit, add to calendar) and JSON-LD on top.

### Confirmation page

**File: `src/app/events/[slug]/confirm/page.tsx`** (new)

Server Component:

```
1. const user = await requireUser()   // redirects to /sign-in if not authed
2. Load event by slug
3. Guard: user must own event, event must be in 'draft' status
4. If event is not draft → redirect to /events/[slug]
5. Render:
   - Success banner: "Your event was saved! Review it below, then submit for approval."
   - EventPreview component
   - "Submit for Review" button (form action → confirmAndSubmit)
   - "Edit Event" link → /events/[slug]/edit
```

### Confirmation action

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

**Email already exists in DB:** Link draft to existing user, send magic link. User authenticates as their existing account. No new account created.

**User doesn't verify email:** Event stays as `draft` with an `ownerId` set but unverified. Invisible to public. Future cleanup can handle stale drafts (out of scope).

**Anonymous draft with no account creation (user abandons at step 2):** Event stays as `draft` with `ownerId=NULL`. Invisible to all queries. Cleanup job can delete drafts with NULL ownerId older than 7 days.

**Rate limiting:** For anonymous drafts (step 1), no rate limit — the draft has no user yet. Rate limit is checked at step 2 when linking to a user. This means someone could spam anonymous drafts, but they're harmless (invisible, no email sent). Add IP-based rate limiting in MVP.5 if needed.

**Draft token cookie lost (e.g., different browser):** User can't claim the draft. They'd need to start over. This is acceptable — same-browser flow is the expected path.

**Logged-in user navigates to /events/new/account:** Redirect to /events/new — they don't need account creation.

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/db/schema/users.ts` | Modify | Add firstName, lastName, phone |
| `src/db/schema/events.ts` | Modify | Make ownerId nullable, add draftToken |
| `src/lib/gravatar.ts` | Create | Gravatar URL helper |
| `src/lib/schemas/account.ts` | Create | Zod schema for account fields |
| `src/app/events/new/page.tsx` | Modify | Pass `user` to EventForm |
| `src/components/events/EventForm.tsx` | Modify | Dual action based on auth state |
| `src/app/events/new/actions.ts` | Modify | Add `createAnonymousDraft` |
| `src/app/events/new/account/page.tsx` | Create | Account creation page (step 2) |
| `src/components/events/AccountForm.tsx` | Create | Account form with phone formatting, Gravatar |
| `src/app/events/new/account/actions.ts` | Create | `createAccountAndClaimDraft` |
| `src/components/events/EventPreview.tsx` | Create | Shared event preview component |
| `src/app/events/[slug]/confirm/page.tsx` | Create | Confirmation/preview page |
| `src/app/events/[slug]/confirm/actions.ts` | Create | `confirmAndSubmit` action |
| `src/app/events/[slug]/page.tsx` | Modify | Use EventPreview component |

---

## Verification

1. `pnpm typecheck` passes
2. `pnpm lint` passes
3. `pnpm build` succeeds
4. Manual test (unauthenticated): `/events/new` → fill event → "Next" → `/events/new/account` → fill account fields → submit → `/verify` → click magic link → `/events/[slug]/confirm` → "Submit for Review" → event detail with "pending review" banner
5. Manual test (existing email): same as above, but at step 2 enter an existing email → magic link sent, no new account created → verify → confirm page works
6. Manual test (authenticated): `/events/new` → fill event → "Submit for Review" → redirects to event detail page (current behavior unchanged)
