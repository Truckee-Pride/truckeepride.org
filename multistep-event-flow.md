# Multi-Step Event Submission Flow

> Full spec for MVP.2.12. Depends on MVP.2.1–2.7 (Auth.js infrastructure) being complete.

---

## User Flow

### Unauthenticated user

```
Step 1: /events/new (not logged in)
  Shows account creation form: first name, last name, email, phone, profile photo
  "Already have an account? Sign In" link at top toggles to email-only sign-in mode
  → Creates user record (or finds existing) → sends magic link
  → Redirect to /verify?email=...&next=/events/new

Step 2: /verify
  "Check your email" page with resend option

Step 3: Click magic link in email
  → Authenticated → redirected to /events/new (now logged in)

Step 4: /events/new (logged in)
  Standard event form → click "Submit"
  → Event saved as draft in DB
  → Redirect to /events/[slug]/confirm

Step 5: /events/[slug]/confirm
  Preview of event page + "Submit for Review" button
  → Transitions draft → pending_review
  → Redirect to /events/[slug]
```

### Logged-in user

```
Step 1: /events/new (logged in)
  Standard event form → click "Submit"
  → Event saved as draft
  → Redirect to /events/[slug]/confirm

Step 2: /events/[slug]/confirm
  Preview + "Submit for Review"
  → Redirect to /events/[slug]
```

Both paths go through the confirmation page. The only difference is logged-in users skip account creation and magic link verification.

---

## Why Account Creation First

Authenticating before the event form eliminates the need for anonymous drafts:

- `ownerId` stays `NOT NULL` — no schema change to events table
- No `draftToken` column or cookie needed
- No anonymous DB writes from unauthenticated users (major security win)
- Image uploads stay auth-gated (existing behavior)
- Rate limiting works naturally (tied to user ID)
- Simpler code: one `createEvent` action handles both flows, always creates a draft with an owner

---

## DB Schema Changes

### User profile columns

**File: `src/db/schema/users.ts`**

Replace the `name` column with `firstName`, `lastName`, and `phone`:

```
— Remove:
name: text('name')

— Add:
firstName: text('first_name').notNull()
lastName: text('last_name').notNull()
phone: text('phone').notNull()
```

All three fields are required (NOT NULL). The old `name` column is removed entirely.

Update `User` and `NewUser` types (auto-inferred from schema). Update all code that references `user.name` to use `user.firstName` / `user.lastName` (or a derived `${firstName} ${lastName}`).

### Seed migration

The migration should update the existing dev user:

```sql
UPDATE users
SET first_name = 'Legacy',
    last_name = 'Owner',
    email = 'legacy@truckeepride.org',
    phone = '+10000000000'
WHERE id = 'dev-user-id';
```

Also update the auth stub (`src/lib/auth-stub.ts`) to match:

```ts
const DEV_USER: User = {
  id: 'dev-user-id',
  firstName: 'Legacy',
  lastName: 'Owner',
  email: 'legacy@truckeepride.org',
  phone: '+10000000000',
  // ...
}
```

### Events table: no changes needed

The events table already supports `status='draft'` and `ownerId` as NOT NULL. Since the user authenticates before creating the event, all drafts have an owner. No schema changes needed.

### Draft lifecycle

| Step | Event state |
|------|-------------|
| Step 4: event form submit | `status='draft'`, `ownerId=<user.id>` |
| Between steps 4 and 5 | Draft persists in DB; user can navigate away and return |
| Step 5: confirm + submit | `status='pending_review'`, `ownerId=<user.id>` |

The event stays as a draft until the user explicitly clicks "Submit for Review" on the confirmation page. If the user abandons at step 4, the draft remains in their account and they can find it later (via "My Events" or a direct link).

### Migration

Run: `npx drizzle-kit generate && npx drizzle-kit migrate`

---

## Security Safeguards

### Threat model

| Attack vector | Risk | Mitigation |
|--------------|------|-----------|
| Account creation spam | Attacker creates many accounts to pollute DB | IP-based rate limit on account creation: **5 per IP per hour** (in-memory or Vercel KV). Cloudflare Turnstile (MVP.5.2) adds CAPTCHA. |
| Magic link email spam | Attacker triggers magic link emails to arbitrary addresses | Per-email rate limit: **3 magic links per email per hour**. Prevents using the form to harass someone's inbox. |
| Image upload abuse (gore, CSAM, storage costs) | Attacker uploads harmful or expensive images | **Upload endpoint stays auth-gated** — only authenticated users can upload. Since account creation is step 1, users must verify email before uploading anything. Profile photo upload also requires auth (it's on the account form, but uploaded after magic link verification — see note below). |
| Draft spam from authenticated users | Verified user creates many draft events | Existing rate limit: 3 pending events for new users, 10 for trusted users. Drafts count toward this limit. |
| Offensive text content | Attacker puts gore/slurs in title/description | Admin approval queue — nothing goes public without review. Admins see it, but the text is gated behind a review step. |
| Disposable email abuse | Throwaway emails to create many accounts | Disposable email domain blocking in Auth.js signIn callback (MVP.5.3). |

### Profile photo timing

The profile photo `ImageUpload` is on the account creation form (step 1), but the upload endpoint requires authentication. Two options:

**Option A (recommended): Defer profile photo upload to after verification.** Show the ImageUpload field on the account form but with a note: "You can add a profile photo after verifying your email." The field is disabled/hidden for new signups. After magic link verification, the user can update their profile photo from a settings page or on return visits.

**Option B:** Allow selecting a file on the account form, but only upload it after magic link verification. Store the file selection in client state. When the user returns authenticated, the confirmation page or a post-auth hook triggers the upload. More complex, worse UX if they open the magic link on a different device.

**Gravatar is unaffected** — it's a read-only URL lookup, no upload needed. The Gravatar URL can be set as the user's `image` during account creation without any upload.

### IP-based rate limiting implementation

Add a lightweight in-memory rate limiter for the account creation server action:

```ts
// Simple sliding window: Map<ip, timestamps[]>
// Check: filter timestamps within last hour, reject if >= 5
```

This is an in-memory Map that resets on deploy — acceptable for a small nonprofit site. For production hardening, upgrade to Vercel KV or Upstash Redis (post-MVP).

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

Used during account creation: if a Gravatar exists for the email, store its URL as the user's `image` field. No upload needed.

---

## Account Fields Schema

**File: `src/lib/schemas/account.ts`** (new)

```ts
import { z } from 'zod'

// Strip non-digits, then validate length
const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .transform((val) => val.replace(/\D/g, ''))
  .pipe(
    z.string()
      .min(10, 'Phone number must be at least 10 digits')
      .max(15, 'Phone number is too long')
      .regex(/^\d+$/, 'Phone number must contain only digits')
  )

export const accountFieldsSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .max(254, 'Email is too long')
    .transform((val) => val.toLowerCase().trim()),
  phone: phoneSchema,
})

export type AccountFieldsInput = z.infer<typeof accountFieldsSchema>
```

### Validation notes

| Field | Rules | Why |
|-------|-------|-----|
| firstName | 1–50 chars, letters/spaces/hyphens/apostrophes only | Allows names like "Mary-Jane" and "O'Brien" while blocking injection |
| lastName | Same as firstName | Same reasoning |
| email | Standard email format, max 254 chars (RFC 5321), lowercased + trimmed | Prevents duplicates from casing, enforces spec max length |
| phone | Strip formatting → 10–15 digits only | 10 digits = US number, up to 15 = international (ITU-T E.164 max). Raw digits stored in DB; formatting is display-only. |

Profile photo is excluded from the schema — it's set from Gravatar during account creation or uploaded later after auth.

---

## Step 1: Account Creation / Sign-In

### Page

**File: `src/app/events/new/page.tsx`** (modify)

```tsx
export default async function NewEventPage() {
  const user = await getCurrentUser()

  if (!user) {
    // Show account creation / sign-in form
    return (
      <main className={LayoutWidth.wide}>
        <PageHeader
          title="Submit Event"
          subtitle="Create an account to submit your event for review."
        />
        <AccountForm redirectTo="/events/new" />
      </main>
    )
  }

  // Logged-in: show event form
  return (
    <main className={LayoutWidth.wide}>
      <PageHeader
        title="Submit Event"
        subtitle="Fill out the details below. Your event will be reviewed before it goes live."
      />
      <EventForm />
    </main>
  )
}
```

### AccountForm component

**File: `src/components/events/AccountForm.tsx`** (new, client component)

Two modes controlled by React state:

**Default mode: "Create Account"**

At the top: `Already have an account?` `<TextLink onClick={handleToggleMode}>Sign In</TextLink>`

Fields:
- `Input` name="firstName", label="First Name", required, `autoComplete="given-name"`
- `Input` name="lastName", label="Last Name", required, `autoComplete="family-name"`
- `Input` name="email", label="Email", required, `type="email"`, `autoComplete="email"`, `inputMode="email"`
- Phone number field (see below)
- Gravatar preview (see below)
- Hidden input: `redirectTo`
- `Button`: "Create Account"

**Sign-in mode (after clicking "Sign In")**

At the top: `New here?` `<TextLink onClick={handleToggleMode}>Create Account</TextLink>`

Fields:
- `Input` name="email", label="Email", required, `type="email"`, `autoComplete="email"`, `inputMode="email"`
- Hidden input: `redirectTo`
- `Button`: "Send Login Link"

The toggle switches between modes using React state. Each mode uses a different server action.

### Phone number field

```
name="phone"
label="Phone Number"
type="tel"
autoComplete="tel"
inputMode="tel"
```

**Auto-formatting as you type:** Add a `handlePhoneChange` handler that formats raw digits into `(xxx) xxx-xxxx`:
- Strip non-digit characters on each keystroke
- 0–3 digits: show raw
- 4–6 digits: `(xxx) xxx`
- 7–10 digits: `(xxx) xxx-xxxx`

Use controlled state for the display value. Store raw digits in a hidden input (`name="phone"`) for server-side validation.

This can be done inline in the `AccountForm` component — no separate utility needed (used in one place only).

### Browser autofill attributes

All fields use standard `autoComplete` values so browsers and password managers autofill correctly:

| Field | `autoComplete` | `type` | `inputMode` |
|-------|---------------|--------|-------------|
| First Name | `given-name` | `text` | (default) |
| Last Name | `family-name` | `text` | (default) |
| Email | `email` | `email` | `email` |
| Phone | `tel` | `tel` | `tel` |

The `<form>` should have `autoComplete="on"`.

### Gravatar integration

When the user types their email (debounce ~500ms):
1. Call a server action or API route that returns the Gravatar URL: `getGravatarUrl(email)` (server-side, since MD5 via `crypto` module is Node-only)
2. Use an `<img>` tag with `onLoad`/`onError` handlers to test the URL
3. If image loads: show as circular preview with "We found your Gravatar" text
4. If 404: show nothing

The Gravatar URL is stored in a hidden input. On account creation, it's saved as the user's `image` field. No file upload needed — it's just a URL.

### Server action: `createAccountAndSignIn`

**File: `src/app/events/new/actions.ts`** (modify — add new action)

```
createAccountAndSignIn(prevState, formData):
  1. IP-based rate limit check (5 per IP per hour) → return error if exceeded
  2. Parse + validate account fields with accountFieldsSchema
  3. Return field errors if validation fails
  4. Read redirectTo from form data

  5. Check if user exists by email:

     If email exists in DB:
       → Update firstName/lastName/phone where currently null
       → Per-email rate limit check (3 per email per hour) → return error if exceeded
       → Send magic link: signIn('resend', {
           email, redirect: false,
           redirectTo
         })
       → redirect(`/verify?email=${email}&next=${redirectTo}`)

     If email is new:
       → Insert new user (firstName, lastName, email, phone, image=gravatarUrl, role='user')
       → Send magic link (same as above)
       → redirect(`/verify?email=${email}&next=${redirectTo}`)
```

### Server action: `sendSignInLink`

**File: `src/app/events/new/actions.ts`** (or colocate with AccountForm)

```
sendSignInLink(prevState, formData):
  1. IP-based rate limit check
  2. Validate email
  3. Per-email rate limit check (3 per email per hour)
  4. Read redirectTo from form data
  5. Send magic link: signIn('resend', {
       email, redirect: false,
       redirectTo
     })
  6. redirect(`/verify?email=${email}&next=${redirectTo}`)
```

This action does NOT check if the email exists — Auth.js handles "find or create" on magic link verification. If the email doesn't exist, Auth.js creates the user when they click the link.

---

## Step 2: Verify Page

Already specified in MVP.2.6. Accepts `?email=...&next=...`. Shows: "We sent a magic link to {email}. Click the link to continue." Resend button available.

---

## Step 3: Magic Link → Back to Event Form

Auth.js handles authentication. The `redirectTo` was set to `/events/new`. After clicking the magic link, the user is authenticated and redirected to `/events/new`, which now shows the event form (since `getCurrentUser()` returns a user).

---

## Step 4: Event Form (Logged In)

### EventForm changes

**File: `src/components/events/EventForm.tsx`** (modify)

Minimal change: the `createEvent` server action now saves the event as a **draft** instead of auto-submitting for review. Redirect goes to the confirmation page instead of the event detail page.

Button text: "Preview & Submit"

### Modified server action: `createEvent`

**File: `src/app/events/new/actions.ts`** (modify existing action)

Change:
1. Create event with `status: 'draft'` (already does this)
2. **Remove** the automatic `submitEventForReview()` call
3. Redirect to `/events/${slug}/confirm` instead of `/events/${slug}`

```diff
- await submitEventForReview(event.id, user.id)
- redirect(`/events/${event.slug}`)
+ redirect(`/events/${event.slug}/confirm`)
```

This is the only change to the existing `createEvent` action. Both logged-in and previously-unauthenticated users use the same action.

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

```
confirmAndSubmit(eventId):
  1. const user = await requireUser()
  2. Load event, verify user owns it
  3. Verify event.status === 'draft'
  4. Call existing submitEventForReview(event.id, user.id)
  5. redirect(`/events/${event.slug}`)
```

Reuses the existing `submitEventForReview` function from `src/app/events/new/actions.ts`.

---

## Security Safeguards

### Threat model

| Attack | Risk | Mitigation |
|--------|------|-----------|
| Account creation spam | Flood DB with user records | IP rate limit: **5 accounts per IP per hour** (in-memory Map). Cloudflare Turnstile on form (MVP.5.2). |
| Magic link email spam | Harass someone's inbox or burn Resend quota | Per-email rate limit: **3 sends per email per hour**. IP rate limit also applies. |
| Image upload abuse (gore, CSAM, storage) | Harmful content or storage cost attack | Upload endpoint requires auth — no uploads without verified email. Flyer images reviewed by admin before event goes public. |
| Draft spam from verified users | Many junk draft events | Existing rate limit: 3 pending (draft + pending_review) for new users, 10 for trusted. |
| Offensive text in events | Gore/slurs in title/description | Admin approval queue — nothing public without review. |
| Disposable email accounts | Throwaway emails to bypass rate limits | Disposable email domain blocking (MVP.5.3). |
| Brute force magic link tokens | Guess verification tokens | Auth.js tokens are cryptographically random + expire after 24h. Standard protection. |

### IP rate limiting implementation

**File: `src/lib/ip-rate-limit.ts`** (new)

Simple in-memory sliding window rate limiter:

```ts
// Map<string, number[]> — key is IP, value is array of timestamps
// On each request: filter timestamps within window, reject if >= limit
// Prune old entries periodically to prevent memory leak
```

Used in `createAccountAndSignIn` and `sendSignInLink` server actions. Get client IP from `headers().get('x-forwarded-for')`.

This is an in-memory Map that resets on deploy — acceptable for a small nonprofit. Upgrade to Vercel KV or Upstash Redis for production hardening (post-MVP).

### Profile photo safety

Profile photos (via Gravatar or future upload) are **not available at account creation time** in the unauthenticated flow. The Gravatar URL is stored as the user's `image` on account creation — this is a read-only URL reference, not a file upload, so no abuse vector.

Direct image uploads require authentication. When upload support is added to account settings (post-MVP), it will be auth-gated automatically.

---

## Edge Cases

**Email already exists in DB (create account mode):** Update null profile fields (don't overwrite existing data), send magic link. User authenticates as their existing account. No error shown — from the user's perspective, it works the same as signing in.

**Email already exists in DB (sign-in mode):** Just send magic link. Standard Auth.js flow.

**Email doesn't exist in DB (sign-in mode):** Auth.js creates the user on magic link verification (standard adapter behavior). The user won't have firstName/lastName/phone set — they can add these later.

**Stale drafts:** Authenticated users who create drafts but never confirm them: drafts stay in DB, count toward rate limit. Users can delete or edit their drafts from "My Events" (post-MVP). No cleanup job needed — drafts have owners and are bounded by rate limits.

**Magic link opened on different device:** User is authenticated on the new device, redirected to `/events/new`. Since they're now logged in, they see the event form. Any draft they created on the original device is accessible via "My Events" or direct URL.

**Logged-in user navigates directly to /events/new:** Sees the event form immediately, no account step.

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/db/schema/users.ts` | Modify | Add firstName, lastName, phone columns |
| `src/lib/gravatar.ts` | Create | Gravatar URL helper |
| `src/lib/ip-rate-limit.ts` | Create | In-memory IP rate limiter |
| `src/lib/schemas/account.ts` | Create | Zod schema for account fields |
| `src/app/events/new/page.tsx` | Modify | Show AccountForm or EventForm based on auth |
| `src/components/events/AccountForm.tsx` | Create | Account creation + sign-in toggle form |
| `src/components/events/EventForm.tsx` | Modify | Button text → "Preview & Submit" |
| `src/app/events/new/actions.ts` | Modify | Add `createAccountAndSignIn`, `sendSignInLink`; update `createEvent` to skip auto-submit and redirect to confirm |
| `src/components/events/EventPreview.tsx` | Create | Shared event preview component |
| `src/app/events/[slug]/confirm/page.tsx` | Create | Confirmation/preview page |
| `src/app/events/[slug]/confirm/actions.ts` | Create | `confirmAndSubmit` action |
| `src/app/events/[slug]/page.tsx` | Modify | Use EventPreview component |

Note: No changes to `src/db/schema/events.ts` — `ownerId` stays NOT NULL, no `draftToken` needed.

---

## Verification

1. `pnpm typecheck` passes
2. `pnpm lint` passes
3. `pnpm build` succeeds
4. Manual test (new user): `/events/new` → see account form → fill in name/email/phone → submit → `/verify` → click magic link → `/events/new` (now logged in) → fill event form → "Preview & Submit" → `/events/[slug]/confirm` → "Submit for Review" → event detail with "pending review" banner
5. Manual test (existing user, create account mode): enter existing email + name/phone → magic link sent, existing account used → same flow
6. Manual test (sign-in mode): click "Sign In" → enter email → "Send Login Link" → verify → `/events/new` → event form
7. Manual test (already logged in): `/events/new` → event form immediately → submit → confirm → submit for review
8. Rate limit test: submit account creation > 5 times from same IP → error shown
