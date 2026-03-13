# Truckee Pride Website — Task List

> **Actively maintained.** Delete tasks as completed. For architecture decisions and technical reference, see `ARCHITECTURE.md`.

---

## MVP.1.x: Image Uploading

**Goal: Replace flyer URL input with file upload via Vercel Blob.**

- [ ] **MVP.1.1** Set up Vercel Blob, add `BLOB_READ_WRITE_TOKEN` to env
- [ ] **MVP.1.2** Upload server action: accept FormData, validate type (jpeg/png/webp) + size (5MB max), upload to Blob, return URL (`src/lib/blob.ts`)
- [ ] **MVP.1.3** Update EventForm: file input with client-side preview, upload on submit, keep URL fallback (`src/components/events/EventForm.tsx`)
- [ ] **MVP.1.4** Configure `next.config.ts` `images.remotePatterns` for Blob domain

---

## MVP.2.x: Authentication

**Goal: Replace auth stub with real Auth.js magic link auth. Protect routes and gate visibility.**

- [ ] **MVP.2.0** Resend sandbox setup for dev/testing:
  - Create Resend account (free tier: 3k emails/month, 100/day)
  - Generate API key → add `AUTH_RESEND_KEY` to `.env.local`
  - Generate auth secret → `openssl rand -base64 32` → add `AUTH_SECRET` to `.env.local`
  - Sandbox limitation: can only send to your own Resend account email, from `onboarding@resend.dev`
- [ ] **MVP.2.1** Add Auth.js tables to Drizzle schema (accounts, sessions, verificationTokens). Generate + run migration.
- [ ] **MVP.2.2** Configure Auth.js v5 (`src/lib/auth.ts`): Resend provider, Drizzle adapter, database sessions
- [ ] **MVP.2.3** Auth.js route handler (`src/app/api/auth/[...nextauth]/route.ts`)
- [ ] **MVP.2.4** Replace `getCurrentUser()` stub with real `auth()` session — same return shape
- [ ] **MVP.2.5** Sign-in page `/sign-in`: email input → magic link
- [ ] **MVP.2.6** Verify page `/verify`: "Check your email" + resend link
- [ ] **MVP.2.7** Auth middleware (`src/middleware.ts`): protect `/events/new`, `/events/*/edit`, `/admin/*` → redirect to `/sign-in`
- [ ] **MVP.2.8** Admin guard in `/admin/layout.tsx`: check `role === 'admin'`, show 403
- [ ] **MVP.2.9** Visibility gating: pending/draft/rejected events only visible to owner + admins (page + generateMetadata) (`src/app/events/[slug]/page.tsx`)
- [ ] **MVP.2.10** Permission checks in all server actions:
  - `submitEventForReview`: verify calling user owns the event
  - `approveEvent` / `rejectEvent`: verify `user.role === 'admin'`
- [ ] **MVP.2.11** Minimal header nav with auth UI: Events, Create Event (logged in), Admin (admin), Sign In / Sign Out (`src/app/Header.tsx`)
- [ ] **MVP.2.12** "My Events" tab/filter on `/events` page: show user's own events with status badges

---

## MVP.3.x: Email

**Goal: Magic link emails for auth + notification emails for approval workflow.**

- [ ] **MVP.3.1** Verify truckeepride.org domain in Resend — coordinate with David for DNS access:
  - Add Resend MX record to truckeepride.org DNS
  - Add SPF (TXT) record
  - Add DKIM (TXT) records (Resend provides these)
  - Verify domain in Resend dashboard
  - Update `EMAIL_FROM` env var to `auth@truckeepride.org`
- [ ] **MVP.3.2** Email utility wrapping Resend SDK (`src/lib/email.ts`)
- [ ] **MVP.3.3** Magic link email template — simple, branded (`src/emails/magic-link.tsx`)
- [ ] **MVP.3.4** Event approved notification to owner (`src/emails/event-approved.tsx`)
- [ ] **MVP.3.5** Event rejected notification to owner with reason (`src/emails/event-rejected.tsx`)
- [ ] **MVP.3.6** Wire approve/reject actions to send emails (`src/app/admin/events/actions.ts`)

---

## MVP.4.x: Production Config & Launch

**Goal: Error handling, empty states, domain setup, go live.**

- [ ] **MVP.4.1** Root `error.tsx` boundary — friendly message, no stack traces
- [ ] **MVP.4.2** Root `not-found.tsx` — branded 404 page
- [ ] **MVP.4.3** Empty states: no events on list page, no pending approvals, no user events
- [ ] **MVP.4.4** Custom domain on Vercel (truckeepride.org)
- [ ] **MVP.4.5** DNS cutover: domain → Vercel, Resend email DNS (SPF/DKIM) verified
- [ ] **MVP.4.6** Smoke test all flows: sign in, create event, submit, approve, view, emails. **Go live.**

---

## MVP.5.x: Abuse Prevention

**Goal: Protect event submission from spam, bots, and targeted harassment.**

- [ ] **MVP.5.1** User banning: `bannedAt` column on users, admin "Ban Submitter" button in approval queue, bulk-reject pending events on ban
- [ ] **MVP.5.2** Cloudflare Turnstile (free CAPTCHA) on event submission forms
- [ ] **MVP.5.3** Disposable email domain blocking in Auth.js signIn callback

---

## Deferred to Post-MVP

- [ ] Admin event owners page (`src/app/admin/events/[id]/owners/page.tsx`) — use Drizzle Studio until then
- [ ] Admin user management `/admin/users` — use Drizzle Studio until then
- [ ] Rate limiting on sign-in
- [ ] Full site nav: Get Involved, About, Donate links, mobile hamburger
- [ ] About page, Get Involved page
- [ ] `loading.tsx` skeletons
- [ ] Fancy React Email templates (replace plain text)
- [ ] Design system & visual polish (Dialog, Toast, responsive pass, accessibility audit)
- [ ] SEO: OG images/metadata
- [ ] Analytics: Vercel Analytics and/or Plausible
- [ ] Performance: Lighthouse, Core Web Vitals
